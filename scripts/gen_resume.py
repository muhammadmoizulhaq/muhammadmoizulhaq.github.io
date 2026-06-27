#!/usr/bin/env python3
"""Generate an ATS-safe resume PDF for Muhammad Moiz ul haq.
Output: public/resume/Muhammad-Moiz-Resume.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle,
    KeepTogether,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
FB = "/usr/share/fonts/truetype/freefont"
pdfmetrics.registerFont(TTFont("FreeSans", f"{FB}/FreeSans.ttf"))
pdfmetrics.registerFont(TTFont("FreeSans-Bold", f"{FB}/FreeSansBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSans-Italic", f"{FB}/FreeSansOblique.ttf"))
pdfmetrics.registerFont(TTFont("FreeSans-BoldItalic", f"{FB}/FreeSansBoldOblique.ttf"))
registerFontFamily(
    "FreeSans",
    normal="FreeSans", bold="FreeSans-Bold",
    italic="FreeSans-Italic", boldItalic="FreeSans-BoldItalic",
)

# ── Palette (ATS-safe: dark colours only, prints as near-black) ──
ACCENT = colors.HexColor("#92400e")   # amber-800 — section headers + rules
INK = colors.HexColor("#1a1a1a")      # body text
MUTED = colors.HexColor("#525252")    # meta / contact
RULE = colors.HexColor("#b45309")     # separator rule (amber-700)

# ── Styles ──
name_style = ParagraphStyle(
    "Name", fontName="FreeSans-Bold", fontSize=23, leading=26,
    alignment=TA_CENTER, textColor=INK, spaceAfter=1,
)
title_style = ParagraphStyle(
    "Title", fontName="FreeSans-Bold", fontSize=11.5, leading=14,
    alignment=TA_CENTER, textColor=ACCENT, spaceAfter=4,
)
contact_style = ParagraphStyle(
    "Contact", fontName="FreeSans", fontSize=9.5, leading=13,
    alignment=TA_CENTER, textColor=MUTED, spaceAfter=2,
)
section_title_style = ParagraphStyle(
    "SectionTitle", fontName="FreeSans-Bold", fontSize=12, leading=15,
    textColor=ACCENT, spaceBefore=9, spaceAfter=2,
)
job_title_style = ParagraphStyle(
    "JobTitle", fontName="FreeSans-Bold", fontSize=10.5, leading=13,
    textColor=INK, spaceAfter=0,
)
job_meta_style = ParagraphStyle(
    "JobMeta", fontName="FreeSans-Italic", fontSize=9.5, leading=12,
    textColor=MUTED, spaceAfter=2,
)
bullet_style = ParagraphStyle(
    "Bullet", fontName="FreeSans", fontSize=9.5, leading=13,
    leftIndent=12, bulletIndent=2, spaceBefore=0, spaceAfter=1, textColor=INK,
)
body_style = ParagraphStyle(
    "Body", fontName="FreeSans", fontSize=9.5, leading=13.5,
    alignment=TA_JUSTIFY, textColor=INK, spaceAfter=2,
)
proj_style = ParagraphStyle(
    "Proj", fontName="FreeSans", fontSize=9.5, leading=13,
    leftIndent=12, bulletIndent=2, spaceBefore=0, spaceAfter=1, textColor=INK,
)
skills_style = ParagraphStyle(
    "Skills", fontName="FreeSans", fontSize=9.5, leading=14, textColor=INK, spaceAfter=1,
)


def section_header(title):
    return [
        Paragraph(f"<b>{title}</b>", section_title_style),
        HRFlowable(width="100%", thickness=0.9, color=RULE, spaceBefore=1, spaceAfter=5),
    ]


def experience_entry(role, company, dates, location, bullets, current=False):
    dot = " ●" if current else ""
    els = [
        Paragraph(f"<b>{role}</b>{dot}", job_title_style),
        Paragraph(f"{company}  |  {dates}  |  {location}", job_meta_style),
    ]
    for b in bullets:
        els.append(Paragraph(f"•  {b}", bullet_style))
    els.append(Spacer(1, 3))
    return els


def project_entry(title, category, url, desc):
    return Paragraph(
        f"•  <b>{title}</b> — {category}. {desc} <font color='#525252'>{url}</font>",
        proj_style,
    )


# ── Build Document ──
OUT = "/home/z/my-project/public/resume/Muhammad-Moiz-Resume.pdf"
doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=1.4 * cm, rightMargin=1.4 * cm,
    topMargin=1.3 * cm, bottomMargin=1.3 * cm,
    title="Resume - Muhammad Moiz ul haq",
    author="Muhammad Moiz ul haq", creator="Muhammad Moiz ul haq",
    subject="Unreal Engine Developer / C++ — Resume",
)

story = []

# Header
story.append(Paragraph("MUHAMMAD MOIZ UL HAQ", name_style))
story.append(Paragraph("Unreal Engine Developer  //  C++", title_style))
story.append(Paragraph(
    "moizulhaq914@gmail.com  |  +971 55 719 1072  |  Abu Dhabi, UAE — Remote Worldwide",
    contact_style,
))
story.append(HRFlowable(width="100%", thickness=1.1, color=ACCENT, spaceBefore=4, spaceAfter=2))

# Summary
story.extend(section_header("PROFESSIONAL SUMMARY"))
story.append(Paragraph(
    "Unreal Engine Developer with 5+ years architecting gameplay systems, multiplayer networking, "
    "and immersive experiences in C++. Shipped titles across virtual cycling, naval combat, battle "
    "royale, and medical training simulations. Specialised in performance-critical C++ systems, "
    "network optimisation, and scalable architecture — consistently reducing latency, memory usage, "
    "and frame drops while mentoring teams and elevating code quality.",
    body_style,
))

# Skills
story.extend(section_header("TECHNICAL SKILLS"))
story.append(Paragraph(
    "<b>Languages:</b>  C / C++ (expert), Python  &nbsp;&nbsp;|&nbsp;&nbsp; "
    "<b>Engine:</b>  Unreal Engine (5+ yrs), Blueprints, Gameplay Framework",
    skills_style,
))
story.append(Paragraph(
    "<b>Core:</b>  Multiplayer Networking, System Architecture &amp; Design, "
    "Game Programming, Performance Profiling &amp; Memory Optimisation",
    skills_style,
))
story.append(Paragraph(
    "<b>Practices:</b>  REST API integration, UI systems, Haptic feedback, "
    "Code refactoring &amp; modularity, Cross-functional collaboration, Mentoring",
    skills_style,
))

# Experience
story.extend(section_header("WORK EXPERIENCE"))

story.extend(experience_entry(
    "Unreal Engine Developer", "MyWhoosh", "Dec 2025 – Present", "Abu Dhabi, UAE",
    [
        "Implement new features to enhance overall user experience and product quality on a virtual cycling platform.",
        "Design and architect scalable gameplay systems aligned with production requirements.",
        "Conduct R&D to improve performance, stability, and development workflows.",
    ], current=True,
))

story.extend(experience_entry(
    "Sr. Unreal Engine Developer (C++)", "Devsinc", "Jul 2024 – Oct 2025", "Lahore, Pakistan",
    [
        "Implemented complex multiplayer networking solutions in C++ that reduced synchronization delays by 10%.",
        "Mentored junior developers on Unreal Engine and C++ best practices, boosting team productivity.",
        "Conducted performance profiling and memory optimisation, reducing memory usage by 5%.",
    ],
))

story.extend(experience_entry(
    "Unreal Engine Developer (C++)", "iBLOXX Studios DMCC", "Dec 2023 – Mar 2024", "Dubai, UAE",
    [
        "Developed C++ gameplay systems improving player-interaction realism; achieved a 20% reduction in session latency through optimised network handling.",
        "Designed C++ interfaces for haptic feedback systems, increasing player engagement.",
        "Refined existing C++ code for modularity, reducing bugs and accelerating future development.",
    ],
))

story.extend(experience_entry(
    "Unreal Engine Developer (C++)", "BIG IMMERSIVE", "Jun 2021 – Dec 2023", "Lahore, Pakistan",
    [
        "Developed core mechanics in C++ improving player retention through enhanced realism.",
        "Refactored C++ code to optimise memory management, reducing load times and improving performance.",
        "Reduced frame-rate drops by 15% through targeted C++ performance optimisations.",
    ],
))

story.extend(experience_entry(
    "Jr. Unreal Engine Developer (C++)", "OZ", "Dec 2020 – Jun 2021", "Lahore, Pakistan",
    [
        "Contributed to C++ gameplay features for sports simulations, enhancing real-time player responsiveness by 25%.",
        "Implemented UI features in C++ within Unreal Engine, improving user satisfaction.",
    ],
))

story.extend(experience_entry(
    "Jr. Unreal Engine Developer (C++)", "Services Hospital", "Oct 2019 – Sep 2020", "Lahore, Pakistan",
    [
        "Built a desktop medical-training app in Unreal Engine helping house-job doctors practise on virtual patients.",
        "Developed a doctor-inventory system and environment interaction (pick/move objects).",
        "Built the full application UI and integrated in-house REST APIs to train and examine doctors.",
    ],
))

# Selected Projects
story.extend(section_header("SELECTED PROJECTS"))
story.append(project_entry(
    "MyWhoosh", "Virtual Cycling Platform",
    "mywhoosh.com", "Indoor racing, training, and events built on Unreal Engine.",
))
story.append(project_entry(
    "Maelstrom", "Online Multiplayer Naval Combat",
    "store.steampowered.com", "Grim-fantasy naval combat — captain Orc, Dwarf, or Human warships; FFA & team matches.",
))
story.append(project_entry(
    "StrayShot", "Third-Person Battle Royale Shooter",
    "strayshot.game", "Fast-paced TPS battle royale with high-quality graphics; solo & squad play.",
))
story.append(project_entry(
    "Virtua Art Gallery & Fancave", "Interactive Virtual Experiences",
    "fab.com", "Customisable digital-collectible Fancave and exclusive Virtua Art Gallery built in Unreal Engine.",
))

doc.build(story)
size = os.path.getsize(OUT)
print(f"OK -> {OUT}  ({size/1024:.1f} KB)")
