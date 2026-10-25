"""Draw the Game Boy Classic theme previews (1600x900) in the four DMG-01 shades.

Everything is drawn on the font's 8px grid so the pixel font stays crisp.
No console, logo or character artwork: the forum and its content are invented.
"""

import random
import sys

from PIL import Image, ImageDraw, ImageFont

FONT = sys.argv[1]
OUT = sys.argv[2]

L0, L1, L2, L3 = "#9bbc0f", "#8bac0f", "#306230", "#0f380f"  # lightest .. darkest
W, H = 1600, 900


def font(size):
    return ImageFont.truetype(FONT, size)


F8, F16, F24, F32 = font(8), font(16), font(24), font(32)


def box(d, x, y, w, h, fill=L1, border=L3, bw=4, shadow=0):
    if shadow:
        d.rectangle([x + shadow, y + shadow, x + w + shadow - 1, y + h + shadow - 1], fill=L3)
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=border)
    d.rectangle([x + bw, y + bw, x + w - bw - 1, y + h - bw - 1], fill=fill)


def text(d, x, y, s, f=F16, fill=L3):
    d.text((x, y), s, font=f, fill=fill)
    return x + f.getlength(s)


# 8x8 pixel faces for avatars (original designs).
FACES = [
    ["00111100", "01111110", "11011011", "11111111", "10111101", "11000011", "01111110", "00111100"],
    ["00000000", "01100110", "01100110", "00000000", "10000001", "01000010", "00111100", "00000000"],
    ["11111111", "10000001", "10100101", "10000001", "10111101", "10000001", "11111111", "00000000"],
    ["00011000", "00111100", "01011010", "01111110", "00100100", "01011010", "10100101", "00000000"],
]


def avatar(d, x, y, size, face, bg=L0, fg=L3):
    box(d, x, y, size, size, fill=bg, border=L3, bw=4)
    px = (size - 8) // 8
    ox, oy = x + (size - px * 8) // 2, y + (size - px * 8) // 2
    for r, row in enumerate(FACES[face]):
        for c, bit in enumerate(row):
            if bit == "1":
                d.rectangle([ox + c * px, oy + r * px, ox + c * px + px - 1, oy + r * px + px - 1], fill=fg)


def heart(d, x, y, px, fill=L3):
    rows = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"]
    for r, row in enumerate(rows):
        for c, bit in enumerate(row):
            if bit == "1":
                d.rectangle([x + c * px, y + r * px, x + c * px + px - 1, y + r * px + px - 1], fill=fill)


def button(d, x, y, label, cursor=False, pressed=False):
    w = int(F16.getlength(label)) + 48 + (24 if cursor else 0)
    if pressed:
        box(d, x + 8, y + 8, w, 56, fill=L2)
        text(d, x + 32, y + 28, label, fill=L0)
    else:
        box(d, x, y, w, 56, fill=L0, shadow=8)
        end = text(d, x + 24, y + 20, label)
        if cursor:
            d.rectangle([end + 12, y + 18, end + 25, y + 37], fill=L3)
    return x + w


def tag(d, x, y, label):
    w = int(F8.getlength(label)) + 20
    d.rectangle([x + 4, y + 4, x + w + 3, y + 27], fill=L3)
    box(d, x, y, w, 24, fill=L0, bw=2)
    text(d, x + 10, y + 8, label, F8)
    return x + w + 16


def header(d, title="PIXEL PLAZA"):
    d.rectangle([0, 0, W, 103], fill=L2)
    d.rectangle([0, 104, W, 111], fill=L3)
    heart(d, 40, 34, 6, fill=L0)
    text(d, 104, 36, title, F32, fill=L0)
    for i, x in enumerate([1344, 1424]):
        box(d, x, 24, 56, 56, fill=L2, border=L0, bw=4)
    text(d, 1360, 44, "?", F24, fill=L0)
    text(d, 1440, 44, "★", F24, fill=L0)
    avatar(d, 1504, 24, 56, 0)


def sidebar(d, active="TOPICS"):
    d.rectangle([0, 112, 359, H], fill=L0)
    d.rectangle([360, 112, 363, H], fill=L3)
    y = 144
    for item in ["TOPICS", "MY POSTS", "MESSAGES"]:
        if item == active:
            box(d, 24, y - 16, 312, 48, fill=L1)
        text(d, 48, y, item)
        y += 64
    y += 16
    text(d, 48, y, "CATEGORIES", F8, fill=L2)
    y += 40
    for name, shade in [("GENERAL", L2), ("SPEEDRUNS", L3), ("CHIPTUNES", L1), ("HIGH SCORES", L2)]:
        d.rectangle([48, y, 63, y + 15], fill=shade)
        d.rectangle([48, y, 63, y + 15], outline=L3, width=2)
        text(d, 80, y, name)
        y += 56


def confetti(d, seed, keep_clear, n=70):
    """Two bursts fired from the bottom corners (angles 60/120, like the real
    effect), never landing on text. Squares get a dark outline so they read as
    confetti rather than dead pixels."""
    import math

    rnd = random.Random(seed)
    placed = 0
    tries = 0
    while placed < n and tries < 5000:
        tries += 1
        left = placed % 2 == 0
        ox, oy = (0, H) if left else (W, H)
        angle = math.radians(rnd.uniform(40, 80))
        dist = rnd.uniform(180, 1150)
        x = ox + (dist * math.cos(angle) if left else -dist * math.cos(angle))
        y = oy - dist * math.sin(angle) - rnd.uniform(0, 120)
        s = rnd.choice([16, 16, 24])
        x, y = int(x) // 8 * 8, int(y) // 8 * 8
        r = (x - 8, y - 8, x + s + 8, y + s + 8)
        if y < 120 or x < 0 or x + s > W or y + s > H:
            continue
        if any(r[0] < b[2] and r[2] > b[0] and r[1] < b[3] and r[3] > b[1] for b in keep_clear):
            continue
        fill = rnd.choice([L1, L2, L3, L0])
        d.rectangle([x, y, x + s - 1, y + s - 1], fill=L3)
        d.rectangle([x + 4, y + 4, x + s - 5, y + s - 5], fill=fill)
        keep_clear.append(r)
        placed += 1


def topic_list():
    im = Image.new("RGB", (W, H), L0)
    d = ImageDraw.Draw(im)
    header(d)
    sidebar(d)

    msg = "WELCOME BACK, PLAYER 1!"
    text(d, 960 - int(F32.getlength(msg)) // 2, 152, msg, F32)
    box(d, 448, 216, 1024, 64, fill=L1)
    text(d, 480, 240, "SEARCH…", fill=L2)

    x = 400
    for label in ["CATEGORIES >", "TAGS >"]:
        x = tag(d, x, 324, label) - 4
    text(d, 704, 328, "LATEST")
    d.rectangle([704, 352, 799, 359], fill=L3)
    text(d, 840, 328, "NEW (3)")
    text(d, 992, 328, "TOP")
    button(d, 1248, 308, "NEW TOPIC", cursor=True)

    top = 400
    text(d, 424, top + 16, "TOPIC", F8, fill=L2)
    text(d, 1312, top + 16, "REPLIES", F8, fill=L2)
    text(d, 1448, top + 16, "ACTIVITY", F8, fill=L2)
    rows = [
        ("MEGA MARINO: WARP ZONES", "SPEEDRUNS", ["ANY%"], [3, 0], "42", "2H", True),
        ("UP UP DOWN DOWN…?!", "GENERAL", ["EASTER-EGG", "SOLVED"], [1, 2], "7", "5M", True),
        ("POST YOUR HIGH SCORES", "HIGH SCORES", ["MEGATHREAD"], [2, 3, 0], "128", "1D", False),
        ("BEST CHIPTUNE OF '89?", "CHIPTUNES", ["POLL"], [0], "23", "3D", False),
    ]
    y = top + 40
    for title, cat, tags, faces, replies, act, unread in rows:
        box(d, 400, y, 1160, 108, fill=L1)
        text(d, 428, y + 22, title, F24, fill=L3 if unread else L2)
        cx = 428
        d.rectangle([cx, y + 64, cx + 15, y + 79], fill=L3)
        cx = text(d, cx + 24, y + 66, cat, F8, fill=L2) + 24
        for t in tags:
            cx = tag(d, cx, y + 60, t)
        for i, f in enumerate(faces):
            avatar(d, 1088 + i * 52, y + 32, 44, f)
        text(d, 1352 - int(F16.getlength(replies)) // 2, y + 46, replies, fill=L3 if unread else L2)
        text(d, 1480, y + 46, act, fill=L2)
        y += 116

    im.save(f"{OUT}/light.png", optimize=True)


def topic_page():
    im = Image.new("RGB", (W, H), L0)
    d = ImageDraw.Draw(im)
    header(d)
    sidebar(d, active="")

    text(d, 400, 144, "UP UP DOWN DOWN…?!", F32)
    d.rectangle([400, 192, 400 + 15, 207], fill=L2)
    text(d, 424, 194, "GENERAL", F8, fill=L2)
    tag(d, 528, 188, "EASTER-EGG")
    tag(d, 680, 188, "SOLVED")

    box(d, 400, 240, 1160, 620, fill=L1, bw=8)
    avatar(d, 432, 272, 72, 1)
    text(d, 528, 280, "PLAYER_2")
    text(d, 1416, 280, "5 MIN", F8, fill=L2)

    y = 336
    d.rectangle([528, y - 4, 528 + int(F16.getlength("@PLAYER1")) + 15, y + 23], fill=L3)
    end = text(d, 536, y, "@PLAYER1", fill=L0)
    text(d, end + 24, y, "YOU WERE RIGHT. TYPE IT ON")
    text(d, 528, y + 40, "ANY PAGE, OUTSIDE A TEXT BOX:")

    box(d, 528, y + 88, 960, 72, fill=L3, border=L2, bw=8)
    text(d, 560, y + 116, "↑ ↑ ↓ ↓ ← → ← → B A", F16, fill=L0)

    text(d, 528, y + 196, "WHAT HAPPENS NEXT", F24)
    for xx in range(528, 1000, 24):
        d.rectangle([xx, y + 232, xx + 11, y + 235], fill=L2)
    text(d, 528, y + 260, "SQUARE CONFETTI, IN ALL FOUR SHADES.")
    text(d, 528, y + 296, "NO CARTRIDGE BLOWING REQUIRED.", fill=L2)

    by = 788
    heart(d, 1180, by + 4, 4)
    text(d, 1220, by + 8, "1UP", F8)
    button(d, 1296, by - 12, "REPLY", cursor=True)

    keep_clear = [
        (40, 128, 340, 600),  # sidebar labels
        (392, 136, 1000, 220),  # title and tags
        (424, 264, 1500, 664),  # post body
        (1170, 772, 1470, 852),  # like + reply
        (352, 112, 372, 900),  # sidebar divider
    ]
    keep_clear += [
        (392, 232, 1568, 252),  # post box borders: no squares sitting on lines
        (392, 848, 1568, 868),
        (392, 232, 412, 868),
        (1548, 232, 1568, 868),
    ]
    confetti(d, 7, keep_clear, n=130)

    im.save(f"{OUT}/dark.png", optimize=True)


topic_list()
topic_page()
