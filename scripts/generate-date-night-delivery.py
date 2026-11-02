from pathlib import Path
import shutil, json, hashlib, re, html
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'release/etsy/date-night-v1'
QA=ROOT/'tmp/pdfs/phase-6-11'
URL='https://date-night-game-1.netlify.app'
NAMES=['01_START_HERE_Date_Night.pdf','02_Date_Night_A4_Color.pdf','03_Date_Night_A4_Ink_Saver.pdf','04_Date_Night_US_Letter_Color.pdf','05_Date_Night_US_Letter_Ink_Saver.pdf']
SOURCES=['Date-Night-Mini-Dates_A4_Color.pdf','Date-Night-Mini-Dates_A4_Ink-Saver.pdf','Date-Night-Mini-Dates_US-Letter_Color.pdf','Date-Night-Mini-Dates_US-Letter_Ink-Saver.pdf']
for n,f in [('Body','segoeui.ttf'),('Bold','segoeuib.ttf'),('Display','georgia.ttf')]:
    pdfmetrics.registerFont(TTFont(n,str(Path('C:/Windows/Fonts')/f)))
OUT.mkdir(parents=True,exist_ok=True);QA.mkdir(parents=True,exist_ok=True)
assert not (set(p.name for p in OUT.iterdir())-set(NAMES)), 'Unexpected release files; inspect manually'
W,H=A4;M=48;WIDTH=W-2*M
INK='#292D26';MUTED='#55594F';GREEN='#516144';ROSE='#873B63';RULE='#DED9CE';PAPER='#FFFEFA'
c=canvas.Canvas(str(OUT/NAMES[0]),pagesize=A4,pageCompression=1,invariant=1)
c.setTitle('Date Night - Start Here');c.setAuthor('Date Night');c.setSubject('Your interactive date and bonus printable guide')
boxes=[]
def text(t,x,y,width=WIDTH,size=11.5,leading=16,color=INK,font='Body'):
    p=Paragraph(t,ParagraphStyle('body',fontName=font,fontSize=size,leading=leading,textColor=HexColor(color)))
    _,h=p.wrap(width,1000);assert y-h>=52,(t,y,h)
    p.drawOn(c,x,y-h);boxes.append((x,y-h,x+width,y));return y-h

def line(y):
    c.setStrokeColor(HexColor(RULE));c.setLineWidth(.6);c.line(M,y,W-M,y)

def header(label):
    c.setFillColor(HexColor(PAPER));c.rect(0,0,W,H,fill=1,stroke=0)
    c.setStrokeColor(HexColor(GREEN));c.setLineWidth(1);c.circle(M+9,H-55,8,stroke=1,fill=0)
    c.setFillColor(HexColor(GREEN));c.wedge(M+3,H-61,M+15,H-49,0,180,stroke=0,fill=1)
    text('DATE NIGHT',M+27,H-48,200,10,13,GREEN,'Bold')
    c.setFillColor(HexColor(MUTED));c.setFont('Body',10);c.drawRightString(W-M,H-58,label)
    line(H-79)

def footer(page):
    line(42);c.setFillColor(HexColor(MUTED));c.setFont('Body',10)
    c.drawString(M,25,'DATE NIGHT / MADE FOR TWO');c.drawRightString(W-M,25,f'{page} / 2')

def step(n,title,detail,y):
    text(str(n).zfill(2),M,y,30,16,20,ROSE,'Display')
    text(title,M+40,y,WIDTH-40,12,16,INK,'Bold')
    return text(detail,M+40,y-21,WIDTH-40,11.5,16,MUTED)-17

header('OPEN THIS FILE FIRST')
y=text('Stop planning.<br/>Start your date.',M,H-109,WIDTH,36,41,INK,'Display')
y=text('Your interactive date is ready.',M,y-14,WIDTH,14,19,MUTED)
cta_top=y-22;cta_bottom=cta_top-51
c.setFillColor(HexColor('#E8EDDF'));c.roundRect(M,cta_bottom,WIDTH,51,8,fill=1,stroke=0)
c.setFillColor(HexColor(GREEN));c.setFont('Bold',13);c.drawCentredString(W/2,cta_bottom+19,'START YOUR DATE')
c.linkURL(URL,(M,cta_bottom,W-M,cta_top),relative=0,thickness=0)
y=text(f'<link href="{URL}" color="{GREEN}"><u>{URL}</u></link>',M,cta_bottom-11,WIDTH,11.5,16)
y=text('No app to install. No account required.<br/>One phone. Two people.',M,y-13,WIDTH,12,18)
y=text('Open in your browser. No login required. Internet is required for WebApp access.',M,y-10,WIDTH,10.8,15,MUTED)
y-=20;line(y);y=text('HOW IT WORKS',M,y-17,WIDTH,10,14,GREEN,'Bold')-15
y=step(1,'Choose your vibe','Cozy / Funny / Romantic / Competitive',y)
y=step(2,'Choose your time','Quick Date - about 15 minutes<br/>Full Date - about 30 minutes',y)
y=step(3,'Choose your intensity','Sweet / Flirty',y)
y=step(4,'Build your date','Connect / Predict / Play / Challenge / Closer',y)
y=step(5,'Go at your own pace','Time is guidance, not a countdown.',y)
footer(1);c.showPage()
header('YOUR DATE, YOUR WAY')
y=text('A little more us.',M,H-108,WIDTH,30,36,INK,'Display')
y=text('YOUR INTERACTIVE EXPERIENCE',M,y-15,WIDTH,10,14,GREEN,'Bold')
y=text('72 activities / 4 vibes / Sweet or Flirty',M,y-11,WIDTH,14,20,INK,'Bold')
y=text('Dynamically composed dates, with about 15 or 30 minute options. Reveal adds comparison instructions where available; Swap offers an eligible replacement.',M,y-10,WIDTH,11.5,17)
y=text('Activities may appear again across different sessions. Flirty can include Sweet activities too.',M,y-9,WIDTH,10.8,15,MUTED)
y-=14;line(y)
y=text('YOUR BONUS OFFLINE MINI-DATES',M,y-13,WIDTH,10,14,GREEN,'Bold')
y=text('Four printable editions. The same four mini-dates.',M,y-10,WIDTH,17,23,INK,'Display')
y=text('Cozy / Funny / Romantic / Competitive. Four fixed dates / 20 activities, each following Connect, Predict, Play, Challenge and Closer.',M,y-10,WIDTH,11.5,17)
y=text('Download for offline use. No phone required once printed. The bonus does not contain all 72 WebApp activities.',M,y-9,WIDTH,10.8,15,MUTED)-16
rows=[('A4 COLOR','02_Date_Night_A4_Color.pdf','A4 paper / full-color printing'),('A4 INK-SAVER','03_Date_Night_A4_Ink_Saver.pdf','A4 paper / reduced ink use'),('US LETTER COLOR','04_Date_Night_US_Letter_Color.pdf','US Letter paper / full-color printing'),('US LETTER INK-SAVER','05_Date_Night_US_Letter_Ink_Saver.pdf','US Letter paper / reduced ink use')]
col=(WIDTH-22)/2;start=y
for i,(label,fn,desc) in enumerate(rows):
    x=M+(i%2)*(col+22);top=start-(i//2)*65
    text(label,x,top,col,10,14,GREEN,'Bold')
    text(fn,x,top-19,col,9.5,13,MUTED)
    text(desc,x,top-37,col,10.5,15)
y=start-130
y=text('You only need the version matching your paper size and printing preference. All four editions contain the SAME mini-dates. Print at Actual Size / 100%.',M,y,WIDTH,11,16)
y=text('SAVE &amp; RETURN',M,y-14,WIDTH,10,14,GREEN,'Bold')
y=text('Your current session saves in this browser on this device, storage permitting. It does not automatically sync between devices. Clearing browser data or private browsing may remove saved progress.',M,y-8,WIDTH,10.8,15,MUTED)
y=text('NEED HELP?',M,y-13,WIDTH,10,14,GREEN,'Bold')
y=text('Send us a message through Etsy and we\u2019ll help you get started.',M,y-7,WIDTH,11.5,16)
y=text('Access the interactive Date Night experience using the link provided with your purchase.',M,y-18,WIDTH,10.5,15,MUTED)
footer(2);c.save()
for src,dest in zip(SOURCES,NAMES[1:]):shutil.copyfile(ROOT/'output/pdf'/src,OUT/dest)
records=[]
for i,name in enumerate(NAMES):
    path=OUT/name;r=PdfReader(path);txt='\n'.join(p.extract_text() or '' for p in r.pages)
    # The approved public URL includes netlify.app; audit internal host mentions separately.
    scrub=txt.replace(URL,'')
    bad=re.findall(r'localhost|127\.0\.0\.1|GitHub|Netlify|Vite|Codex|Phase\s*[67]|\bQA\b|synthetic personas|tests|repository|E:\\|TO BE DEFINED|TODO|PLACEHOLDER|\bTBD\b|example\.com',scrub,re.I)
    assert not bad,(name,bad)
    assert not re.search(r'lifetime|permanent access|unlimited unique|never repeats|AI personalization|gift account|gift-ready',txt,re.I)
    assert len(r.pages)==(2 if i==0 else 6)
    assert path.stat().st_size<20_000_000
    if i:
        src=ROOT/'output/pdf'/SOURCES[i-1]
        assert path.read_bytes()==src.read_bytes()
    links=[a.get_object().get('/A',{}).get('/URI') for p in r.pages for a in p.get('/Annots',[])]
    if i==0:assert URL in links
    rec={'file':name,'pages':len(r.pages),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'dimensions':[[round(float(p.mediabox.width),4),round(float(p.mediabox.height),4)] for p in r.pages],'links':links,'sourceIdentical':True if i else None}
    records.append(rec);(QA/(name+'.txt')).write_text(txt,encoding='utf-8')
(QA/'verification.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records,indent=2))
