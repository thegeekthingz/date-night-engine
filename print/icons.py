"""Small deterministic vector icons; normalized to a 12-point square."""


def draw_icon(canvas, name, x, y, size, color):
    canvas.saveState()
    canvas.translate(x, y)
    canvas.scale(size / 12, size / 12)
    canvas.setStrokeColor(color)
    canvas.setFillColor(color)
    canvas.setLineWidth(1.1)
    canvas.setLineCap(1)
    canvas.setLineJoin(1)
    path = canvas.beginPath()
    if name == 'heart':
        path.moveTo(6, 1)
        path.curveTo(4, 3, 1, 5, 1, 8)
        path.curveTo(1, 11, 4, 12, 6, 9)
        path.curveTo(8, 12, 11, 11, 11, 8)
        path.curveTo(11, 5, 8, 3, 6, 1)
        path.close()
    elif name == 'lock':
        canvas.roundRect(2, 1, 8, 6, 1, stroke=1, fill=0)
        path.moveTo(3.5, 7)
        path.lineTo(3.5, 9)
        path.curveTo(3.5, 12, 8.5, 12, 8.5, 9)
        path.lineTo(8.5, 7)
        canvas.line(6, 3, 6, 5)
    elif name == 'smile':
        canvas.circle(6, 6, 5, stroke=1, fill=0)
        canvas.circle(4, 7.5, .5, stroke=0, fill=1)
        canvas.circle(8, 7.5, .5, stroke=0, fill=1)
        path.moveTo(3.5, 4.5)
        path.curveTo(4.5, 2.5, 7.5, 2.5, 8.5, 4.5)
    elif name == 'bolt':
        path.moveTo(7, 11)
        for point in [(2, 5), (5.5, 5), (5, 1), (10, 7), (6.5, 7)]:
            path.lineTo(*point)
        path.close()
    elif name == 'flame':
        path.moveTo(6, 11)
        path.curveTo(7, 7, 11, 6, 10, 3)
        path.curveTo(9, -1, 2, 0, 2, 4)
        path.curveTo(2, 6, 4, 7, 4, 8)
        path.lineTo(5, 6)
        path.curveTo(6, 7, 7, 9, 6, 11)
        path.close()
    else:
        raise ValueError(f'Unsupported category icon: {name}')
    canvas.drawPath(path, stroke=1, fill=0)
    canvas.restoreState()
