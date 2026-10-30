from pathlib import Path
import json, re, html, hashlib
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, CMYKColor
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'src/data/printable/date-night-mini-dates.json').read_text(encoding='utf-8'))
PACK=json.loads((ROOT/'src/data/cards/date-night-v1.json').read_text(encoding='utf-8'))
OUT=ROOT/'output/pdf'; OUT.mkdir(parents=True,exist_ok=True)
QA=ROOT/'docs/printable-qa'; QA.mkdir(parents=True,exist_ok=True)
for name,file in [('Body','segoeui.ttf'),('Bold','segoeuib.ttf'),('Display','georgia.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
PALETTES={'cozy':('#805512','#FAF1DF'),'funny':('#A5422D','#FCF0E8'),'romantic':('#873B63','#F9EDF3'),'competitive':('#914316','#FBEEE3')}
INK='#242722';MUTED='#55594F';BRAND='#516144'
INKMODE=False
def paint(value):
 c=HexColor(value)
 if INKMODE:
  gray=.2126*c.red+.7152*c.green+.0722*c.blue
  return CMYKColor(0,0,0,1-gray)
 return c

SLOTS=['connect','predict','play','challenge','closer']
def clean(s):
 return s.translate(str.maketrans({'“':'"','”':'"','’':"'",'‘':"'",'…':'...','–':'-','—':'-','‑':'-'}))
def para(text,size=13.0,leading=18.5,color=INK,font='Body'):
 return Paragraph(html.escape(clean(text)),ParagraphStyle('p',fontName=font,fontSize=size,leading=leading,textColor=paint(color)))
records=[]
def draw_p(c,text,x,y,width,size=13.0,leading=18.5,color=INK,font='Body'):
 p=para(text,size,leading,color,font); w,h=p.wrap(width,2000)
 assert y-h>=48,(text,y,h)
 p.drawOn(c,x,y-h);return y-h

def rule(c,x,y,width,color='#D7D9D2'):
 c.setStrokeColor(paint(color));c.setLineWidth(.6);c.line(x,y,x+width,y)

def footer(c,w,h,page,ink):
 rule(c,54,43,w-108,'#C7C7C7' if ink else '#D9DDD2')
 c.setFillColor(paint('#555555' if ink else MUTED));c.setFont('Body',8.5)
 c.drawString(54,28,'DATE NIGHT  /  BONUS OFFLINE MINI-DATES')
 c.drawRightString(w-54,28,f'{page:02d} / 06')

def mark(c,x,y,accent):
 c.setStrokeColor(paint(accent));c.setLineWidth(1.1);c.circle(x,y,10,stroke=1,fill=0)
 c.setFillColor(paint(accent));c.wedge(x-7,y-7,x+7,y+7,0,180,stroke=0,fill=1)

def cover(c,w,h,ink):
 accent='#333333' if ink else BRAND
 if not ink:
  c.setFillColor(paint('#FCFAF5'));c.rect(0,0,w,h,fill=1,stroke=0)
 mark(c,65,h-68,accent)
 c.setFillColor(paint(accent));c.setFont('Bold',10);c.drawString(85,h-72,'DATE NIGHT')
 c.setFont('Bold',9.5);c.drawString(54,h-149,'A LITTLE TIME. JUST THE TWO OF YOU.')
 y=h-188
 for line,size in [('Offline',43),('Mini-Date Pack',39)]:
  c.setFillColor(paint(INK));c.setFont('Display',size);c.drawString(52,y,line);y-=55
 y=draw_p(c,'4 ready-to-play dates for two',54,y-4,w-108,17,24)
 y=draw_p(c,'A bonus offline companion to your interactive Date Night WebApp.',54,y-18,w-150,12.5,19,MUTED)
 y-=44
 names=[('cozy','Cozy','Warm and unhurried'),('funny','Funny','Light and playful'),('romantic','Romantic','A little more spark'),('competitive','Competitive','Friendly rivalry')]
 col=(w-126)/2
 for i,(v,title,desc) in enumerate(names):
  x=54+(i%2)*(col+18);top=y-(i//2)*78
  ac='#444444' if ink else PALETTES[v][0]
  c.setFillColor(paint(ac));c.roundRect(x,top-2,26,3,1.5,stroke=0,fill=1)
  c.setFillColor(paint(INK));c.setFont('Display',18);c.drawString(x,top-29,title)
  c.setFont('Body',10.5);c.setFillColor(paint(MUTED));c.drawString(x,top-47,desc)
 y-=195
 rule(c,54,y,w-108)
 draw_p(c,'Connect  /  Predict  /  Play  /  Challenge  /  Closer',54,y-18,w-108,10.5,16)
 draw_p(c,'One page. Five activities. No prep.',54,y-52,w-108,12.3,18)
 footer(c,w,h,1,ink);c.showPage()

def quick(c,w,h,ink):
 ac='#333333' if ink else BRAND
 c.setFillColor(paint(ac));c.setFont('Bold',10);c.drawString(54,h-65,'YOUR OFFLINE DATE, MADE SIMPLE')
 c.setFillColor(paint(INK));c.setFont('Display',32);c.drawString(52,h-108,'How it works')
 y=draw_p(c,'Pick one date page, settle in together and start at the top. You only need each other - no props, preparation or scorekeeping.',54,h-132,w-108,12.5,18.5)
 steps=[('Pick a vibe.','Choose Cozy, Funny, Romantic or Competitive. Romantic has a little more spark; the other dates keep things Sweet.'),('Start with Connect.','Take turns with the opening activity. Listening is part of the date.'),('Follow all five stages.','Move through Predict, Play, Challenge and Closer in order. For Predict, share your guesses before reading the comparison instruction.'),('Go at your own pace.','Read each activity aloud. Take as long as feels good, and make any activity your own.'),('No prep. No score. No pressure.','Keep it kind and playful. The point is doing something together, not getting anything right.')]
 y-=24
 for i,(title,body) in enumerate(steps):
  c.setFillColor(paint(ac));c.setFont('Display',18);c.drawString(54,y-16,str(i+1).zfill(2))
  y2=draw_p(c,title,92,y,w-146,12.5,18,font='Bold')
  y=draw_p(c,body,92,y2-5,w-146,11.8,16.8,MUTED)-17
 rule(c,54,y+2,w-108)
 y=draw_p(c,'Want a different date next time?',54,y-15,w-108,17,23,font='Display')
 y=draw_p(c,'For personalized combinations, use the interactive Date Night WebApp: choose your vibe, 15 or 30 minutes, and Sweet or Flirty. Randomized dates, Swap and Reveal keep the experience fresh.',54,y-10,w-108,11.8,17)
 draw_p(c,'PRINTING: Choose the matching paper size and print at Actual Size / 100%. Single-sided is simplest; print only the date page you want. No cutting required.',54,y-19,w-108,10.8,15.5,MUTED)
 footer(c,w,h,2,ink);c.showPage()

def date_page(c,w,h,date,page,ink):
 ac,tint=PALETTES[date['vibe']]
 if ink:ac,tint='#333333','#FFFFFF'
 if not ink:
  c.setFillColor(paint(tint));c.roundRect(44,h-148,w-88,98,10,fill=1,stroke=0)
 c.setFillColor(paint(ac));c.setFont('Bold',9.5);c.drawString(54,h-70,'YOUR FIVE-PART DATE  /  '+('A LITTLE MORE SPARK' if date['vibe']=='romantic' else 'SWEET'))
 c.setFont('Display',31);c.drawString(52,h-108,date['title'])
 c.setFont('Body',11.5);c.setFillColor(paint(INK));c.drawString(54,h-132,date['moodLine'])
 y=h-174; width=w-148
 blocks=[]
 for a in date['activities']:
  p=para(a['prompt']);ph=p.wrap(width,2000)[1]
  rh=0
  if a.get('compareInstruction'):rh=18+para(a['compareInstruction'],12.3,17.5).wrap(width-14,2000)[1]+10
  blocks.append((a,ph, rh))
 total=sum(19+ph+rh for a,ph,rh in blocks)
 gap=min(25,(y-67-total)/4)
 assert gap>=12,('page crowding',date['vibe'],w,total,gap)
 for i,(a,ph,rh) in enumerate(blocks):
  top=y
  c.setFillColor(paint(ac));c.setFont('Display',18);c.drawString(54,y-17,str(i+1).zfill(2))
  c.setFont('Bold',10.5);c.drawString(94,y-10,a['slot'].upper())
  y=draw_p(c,a['prompt'],94,y-22,width,13.0,18.5)
  if a.get('compareInstruction'):
   y-=10
   c.setStrokeColor(paint(ac));c.setLineWidth(1);c.line(94,y+1,94,y-rh+14)
   c.setFillColor(paint(ac));c.setFont('Bold',9.5);c.drawString(104,y-8,'NOW COMPARE YOUR ANSWERS')
   y=draw_p(c,a['compareInstruction'],104,y-17,width-14,12.3,17.5)
  assert y>=60,(a['sourceId'],y)
  records.append({'page':page,'id':a['sourceId'],'vibe':date['vibe'],'top':top,'bottom':y,'bodySize':13.0,'compareSize':12.3 if rh else None,'paperWidth':w,'inkSaver':ink})
  if i<4:rule(c,94,y-gap/2,width,'#DDDDDD' if ink else '#E0E2DB')
  y-=gap
 footer(c,w,h,page,ink);c.showPage()

ids=[a['sourceId'] for d in DATA['miniDates'] for a in d['activities']]
assert len(ids)==len(set(ids))==20
for d in DATA['miniDates']:
 assert [a['slot'] for a in d['activities']]==SLOTS
 for a in d['activities']:
  src=next(c for c in PACK if c['id']==a['sourceId']);assert d['vibe'] in src['moods'];assert a['intensity']==src['intensity']
  assert not re.search(r'\b(tap|swipe|click|refresh|swap|done|build my date)\b',a['prompt'],re.I)
  assert (a['slot']=='predict')==bool(a.get('compareInstruction'))
for paper,size in [('A4',A4),('US-Letter',letter)]:
 for mode,ink in [('Color',False),('Ink-Saver',True)]:
  INKMODE=ink
  dest=OUT/f'Date-Night-Mini-Dates_{paper}_{mode}.pdf'
  c=canvas.Canvas(str(dest),pagesize=size,pageCompression=1)
  c.setTitle('Date Night - Offline Mini-Date Pack');c.setAuthor('Date Night');c.setSubject('Four curated bonus offline dates for two')
  cover(c,*size,ink);quick(c,*size,ink)
  for i,d in enumerate(DATA['miniDates']):date_page(c,*size,d,i+3,ink)
  c.save()
  reader=PdfReader(dest);assert len(reader.pages)==6
  text='\n'.join(p.extract_text() for p in reader.pages)
  assert not re.search(r'Girls Night|Spill or Sip|fixture|Infrastructure',text,re.I)
  for i,d in enumerate(DATA['miniDates']):
   t=reader.pages[i+2].extract_text();positions=[t.index(s.upper()) for s in SLOTS];assert positions==sorted(positions)
   for a in d['activities']:
    normalized=' '.join(t.split());assert ' '.join(clean(a['prompt']).split()) in normalized,a['sourceId']
    if a.get('compareInstruction'):assert ' '.join(clean(a['compareInstruction']).split()) in normalized
  for p in reader.pages:assert abs(float(p.mediabox.width)-size[0])<.01 and abs(float(p.mediabox.height)-size[1])<.01
  print(dest.name,6,'pages',size)
(QA/'layout-metrics.json').write_text(json.dumps(records,indent=2))
