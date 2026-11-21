#!/usr/bin/env python3
"""Figures for the blog post "The future of science without human understanding".

Two conceptual line drawings, no data:
  claims-and-records.png   experiments reduced to claims (graphite) and
                           experiments carried through as records (gold)
  temperature-and-cell-types.png  molecules reduced to one temperature (upper row)
                           and cells sorted into a few types (lower row)

The first composition follows a Codex ImageGen draft of 2026-11-20, redrawn here
as geometry so that lines stay crisp. The second reuses the layout of a draft that
showed molecules becoming a fluid. Positions and shapes of molecules and cells are
decorative and come from a fixed seed (SEED below); nothing is measured.

Usage:
  python3 scripts/blog_figures_science_without_understanding_2026-11-20.py \
      --font /path/to/Inter.ttf
Inter is the site font (assets/custom_style.css, --font-sans). It is loaded by
the site from Google Fonts and is not installed locally; download the variable
TTF from https://github.com/google/fonts/tree/main/ofl/inter and pass its path.
Without --font the labels fall back to Helvetica Neue.

The WeChat version of the post uses Chinese labels and a cover without labels:
  python3 scripts/blog_figures_science_without_understanding_2026-11-20.py \
      --lang zh --font "/System/Library/Fonts/Hiragino Sans GB.ttc" --out <post>/figures/final \
      --names fig2_claims_records.png fig1_temperature_cell_types.png \
      --cover <post>/figures/final/cover_235.jpg

Tokens (source: assets/custom_style.css :root)
  GROUND   #faf8f5  --color-bg     page ground, so the figure has no visible box
  GRAPHITE #3a3a3a  --color-text   experiments, claims, labels
  GOLD     #c9a959  --color-gold   the one accent: what is kept in full
  Labels   Inter Regular, 30 px on a 1536 px canvas (about body size on the page)
"""
import argparse
import math
import os
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.font_manager import FontProperties
from matplotlib.patches import Circle, PathPatch, Rectangle
from matplotlib.path import Path

GROUND = "#faf8f5"
GRAPHITE = "#3a3a3a"
GOLD = "#c9a959"
SEED = 20261120
W = 1536
PX = 0.72  # one canvas pixel in points at 100 px per inch
LABEL_PX = 30

# Label text by language. The Chinese set is used for the WeChat version of the post.
LABELS = {
    "en": {"experiments": "experiments", "claims": "claims", "records": "records",
           "result": "result", "molecules": "molecules", "temperature": "temperature",
           "cells": "cells", "cell types": "cell types"},
    "zh": {"experiments": "实验", "claims": "论断", "records": "完整记录",
           "result": "结果", "molecules": "分子", "temperature": "温度",
           "cells": "细胞", "cell types": "细胞类型"},
}
LANG = "en"
SHOW_LABELS = True


def canvas(height):
    fig = plt.figure(figsize=(W / 100, height / 100), dpi=100)
    fig.patch.set_facecolor(GROUND)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(height, 0)
    ax.set_aspect("equal")
    ax.axis("off")
    return fig, ax


def label(ax, x, y, text, font, ha="center"):
    if not SHOW_LABELS:
        return
    text = LABELS[LANG][text]
    ax.text(x, y, text, fontproperties=font, fontsize=LABEL_PX * PX,
            color=GRAPHITE, ha=ha, va="center", zorder=10)


def cubic(ax, p0, c1, c2, p1, color, lw, zorder, cap="round"):
    path = Path([p0, c1, c2, p1], [Path.MOVETO, Path.CURVE4, Path.CURVE4, Path.CURVE4])
    ax.add_patch(PathPatch(path, fill=False, edgecolor=color, linewidth=lw * PX,
                           capstyle=cap, zorder=zorder))


def figure_claims_and_records(out, font):
    height = 760
    fig, ax = canvas(height)

    tile_x, tile = 118, 80
    tops = [78 + 108 * k for k in range(6)]
    nodes = [(585, 118), (680, 165), (572, 205), (742, 248), (612, 312), (690, 340)]
    edges = [(0, 1), (1, 2), (1, 3), (2, 3), (3, 4), (4, 5)]
    ring_c, ring_r = (1380, 520), 62
    band_top, band_gap = 402, 4.0
    band_x0, band_x1 = 720, 1200

    # Lower route: ten lines per experiment, sixty in the band, all kept apart.
    for k, top in enumerate(tops):
        for j in range(10):
            i = 10 * k + j
            y0 = top + 36 + 3.4 * j
            yb = band_top + band_gap * i
            x0 = tile_x + tile
            xm = (x0 + band_x0) / 2
            theta = math.radians(115 + 130 * i / 59)
            end = (ring_c[0] + ring_r * math.cos(theta), ring_c[1] - ring_r * math.sin(theta))
            out_pt = (end[0] + 70 * math.cos(theta), end[1] - 70 * math.sin(theta))
            verts = [(x0, y0), (xm, y0), (xm, yb), (band_x0, yb),
                     (band_x1, yb),
                     (band_x1 + 90, yb), out_pt, end]
            codes = [Path.MOVETO, Path.CURVE4, Path.CURVE4, Path.CURVE4,
                     Path.LINETO,
                     Path.CURVE4, Path.CURVE4, Path.CURVE4]
            ax.add_patch(PathPatch(Path(verts, codes), fill=False, edgecolor=GOLD,
                                   linewidth=1.5 * PX, capstyle="butt", zorder=2))

    # Upper route: each experiment becomes one point, the points form a sparse network.
    for (nx, ny), top in zip(nodes, tops):
        start = (tile_x + tile, top + 16)
        ax.plot([start[0], nx], [start[1], ny], color=GROUND, linewidth=7 * PX,
                solid_capstyle="butt", zorder=3)
        ax.plot([start[0], nx], [start[1], ny], color=GRAPHITE, linewidth=1.6 * PX,
                solid_capstyle="round", zorder=4)
    for a, b in edges:
        ax.plot([nodes[a][0], nodes[b][0]], [nodes[a][1], nodes[b][1]],
                color=GRAPHITE, linewidth=2.2 * PX, solid_capstyle="round", zorder=5)
    top_of_ring = (ring_c[0], ring_c[1] - ring_r)
    cubic(ax, nodes[3], (1100, 248), (ring_c[0], 300), top_of_ring, GRAPHITE, 2.2, 5)
    for nx, ny in nodes:
        ax.add_patch(Circle((nx, ny), 8.5, facecolor=GRAPHITE, edgecolor="none", zorder=6))

    # Experiments: six tables of measurements.
    for top in tops:
        ax.add_patch(Rectangle((tile_x, top), tile, tile, facecolor=GROUND,
                               edgecolor=GRAPHITE, linewidth=1.6 * PX, zorder=7))
        xs = tile_x + 10 + np.arange(10) * (tile - 20) / 9
        ys = top + 10 + np.arange(10) * (tile - 20) / 9
        gx, gy = np.meshgrid(xs, ys)
        ax.scatter(gx.ravel(), gy.ravel(), s=(2 * 1.7 * PX) ** 2, color=GRAPHITE,
                   linewidths=0, zorder=8)

    ax.add_patch(Circle(ring_c, ring_r, facecolor=GROUND, edgecolor=GRAPHITE,
                        linewidth=2.4 * PX, zorder=7))

    label(ax, tile_x, 42, "experiments", font, ha="left")
    label(ax, 778, 186, "claims", font, ha="left")
    label(ax, (band_x0 + band_x1) / 2, 684, "records", font)
    label(ax, ring_c[0], 684, "result", font)

    fig.savefig(out, dpi=160, facecolor=GROUND)
    plt.close(fig)


def figure_temperature_and_cell_types(out, font):
    """Two rows with one grammar: many separate things on the left, few on the right."""
    height = 750
    fig, ax = canvas(height)
    rng = np.random.default_rng(SEED)
    line_x0, end_x = 640, 1240

    def molecule(x, y):
        angle = rng.uniform(0, 2 * np.pi)
        ax.plot([x, x + 13 * np.cos(angle)], [y, y + 13 * np.sin(angle)],
                color=GRAPHITE, linewidth=1.7 * PX, solid_capstyle="round", zorder=4)
        ax.add_patch(Circle((x, y), 4.3, facecolor=GRAPHITE, edgecolor="none", zorder=5))

    def cell(x, y):
        r = rng.uniform(7.0, 11.5)
        nr = rng.uniform(2.0, 3.8)
        angle = rng.uniform(0, 2 * np.pi)
        off = rng.uniform(0, r - nr - 2.0)
        ax.add_patch(Circle((x, y), r, facecolor=GROUND, edgecolor=GRAPHITE,
                            linewidth=1.6 * PX, zorder=4))
        ax.add_patch(Circle((x + off * np.cos(angle), y + off * np.sin(angle)), nr,
                            facecolor=GRAPHITE, edgecolor="none", zorder=5))

    def field(draw, top, row_gap):
        for col in range(11):
            for row in range(6):
                x = 108 + 40 * col + rng.uniform(-11, 11)
                y = top + row_gap * row + rng.uniform(-12, 12)
                keep = 1.0 if x < 440 else max(0.0, 1 - (x - 440) / 100)
                if rng.uniform() < keep:
                    draw(x, y)

    def gold_line(y, x1):
        ax.plot([line_x0, x1], [y, y], color=GOLD, linewidth=1.8 * PX,
                solid_capstyle="butt", zorder=2)
        steps = np.linspace(540, line_x0, 21)
        for a, b in zip(steps[:-1], steps[1:]):
            width = 0.4 + 1.4 * (a - 540) / (line_x0 - 540)
            ax.plot([a, b + 0.8], [y, y], color=GOLD, linewidth=width * PX,
                    solid_capstyle="butt", zorder=2)

    steps_x = (585, 650, 725, 810, 900, 995, 1095)

    # Upper row: molecules, each moving its own way, become one number.
    mid = 190
    field(molecule, 80, 44)
    gold_line(mid, end_x)
    for x, count in zip(steps_x, (4, 4, 3, 2, 2, 1, 1)):
        spread = 105 * max(0.0, 1 - (x - 585) / 560) ** 1.6
        for _ in range(count):
            molecule(x + rng.uniform(-16, 16), mid + rng.uniform(-spread, spread))
    ax.add_patch(Circle((end_x, mid), 15, facecolor=GOLD, edgecolor="none", zorder=6))
    label(ax, 310, 340, "molecules", font)
    label(ax, end_x + 42, mid, "temperature", font, ha="left")

    # Lower row: cells, no two drawn alike, become a few identical types.
    type_r = 27
    field(cell, 430, 48)
    for y in (470, 550, 630):
        gold_line(y, end_x - type_r)
        for x in steps_x:
            spread = 20 * max(0.0, 1 - (x - 585) / 420)
            cell(x + rng.uniform(-14, 14), y + rng.uniform(-spread, spread))
        ax.add_patch(Circle((end_x, y), type_r, facecolor=GROUND, edgecolor=GOLD,
                            linewidth=3.2 * PX, zorder=6))
        ax.add_patch(Circle((end_x, y), 8.5, facecolor=GOLD, edgecolor="none", zorder=7))
    label(ax, 310, 716, "cells", font)
    label(ax, end_x + 54, 550, "cell types", font, ha="left")

    fig.savefig(out, dpi=160, facecolor=GROUND)
    plt.close(fig)


def write_cover(path, font):
    """The first figure without labels, padded with the ground colour to 2.35 to 1."""
    global SHOW_LABELS
    import tempfile

    from PIL import Image
    SHOW_LABELS = False
    try:
        with tempfile.TemporaryDirectory() as tmp:
            raw = os.path.join(tmp, "cover_raw.png")
            figure_claims_and_records(raw, font)
            art = Image.open(raw).convert("RGB")
    finally:
        SHOW_LABELS = True
    width = round(art.height * 2.35)
    ground = tuple(int(GROUND[i:i + 2], 16) for i in (1, 3, 5))
    cover = Image.new("RGB", (width, art.height), ground)
    cover.paste(art, ((width - art.width) // 2, 0))
    cover.save(path, "JPEG", quality=92)
    print(f"Wrote {path}")


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    default_out = os.path.join(here, "..", "static", "blog", "science-without-human-understanding")
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--font", help="path to an Inter TTF; falls back to Helvetica Neue")
    parser.add_argument("--out", default=default_out, help="output folder")
    parser.add_argument("--lang", choices=sorted(LABELS), default="en",
                        help="label language; zh needs a Chinese font in --font")
    parser.add_argument("--names", nargs=2, metavar=("CLAIMS", "IDEAS"),
                        default=["claims-and-records.png", "temperature-and-cell-types.png"],
                        help="file names of the two figures")
    parser.add_argument("--cover", help="also write a 2.35 to 1 JPEG cover without labels to this path")
    args = parser.parse_args()
    global LANG
    LANG = args.lang

    if args.font:
        if not os.path.isfile(args.font):
            sys.exit(f"Font file not found: {args.font}")
        font = FontProperties(fname=args.font)
    else:
        print("No --font given; labels use Helvetica Neue instead of Inter.", file=sys.stderr)
        font = FontProperties(family="Helvetica Neue")

    try:
        os.makedirs(args.out, exist_ok=True)
        first = os.path.join(args.out, args.names[0])
        second = os.path.join(args.out, args.names[1])
        figure_claims_and_records(first, font)
        figure_temperature_and_cell_types(second, font)
        if args.cover:
            write_cover(args.cover, font)
    except OSError as err:
        sys.exit(f"Could not write figures to {args.out}: {err}")
    print(f"Wrote {first}")
    print(f"Wrote {second}")


if __name__ == "__main__":
    main()
