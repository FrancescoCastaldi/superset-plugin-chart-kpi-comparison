"""
Capture headless screenshots of KPI Comparison Card Dev Studio and compile
an optimized animated GIF and high-resolution preview images for README.md.
"""

import os
import time
from PIL import Image
from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_IMAGES = os.path.join(REPO_ROOT, "docs", "images")
SRC_IMAGES = os.path.join(REPO_ROOT, "src", "images")

os.makedirs(DOCS_IMAGES, exist_ok=True)
os.makedirs(SRC_IMAGES, exist_ok=True)

FRAMES = [
    {
        "name": "01_outpatient_visits.png",
        "url": "http://localhost:5175/?scenario=outpatient-visits&tab=typography&bg=dark&w=340&h=170",
        "description": "Visite Ambulatoriali: Dual Metric Comparison (+10.8%), Inter Font, Cubic Bezier Sparkline",
    },
    {
        "name": "02_wait_time_inverted_polarity.png",
        "url": "http://localhost:5175/?scenario=wait-time&tab=aesthetic&bg=dark&w=340&h=170",
        "description": "Tempi di Attesa PS: Inverted Polarity (-18.2% in Green), Poppins Font, Custom Border",
    },
    {
        "name": "03_budget_revenue.png",
        "url": "http://localhost:5175/?scenario=budget-revenue&tab=sparkline&bg=dark&w=360&h=175",
        "description": "Budget Ricavi: Currency Format, Peak Sparkline Marker & Current Point",
    },
    {
        "name": "04_executive_glassmorphism.png",
        "url": "http://localhost:5175/?scenario=executive-dark&tab=typography&bg=dark&w=360&h=175",
        "description": "Executive Glassmorphism: Dark Theme, Montserrat Font & Tabular Nums",
    },
]

def capture_frames():
    print("Connecting to KPI Comparison Dev Studio via Chrome headless...")
    captured_paths = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
        )
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        for frame in FRAMES:
            out_path = os.path.join(DOCS_IMAGES, frame["name"])
            print(f"Capturing: {frame['url']} -> {frame['name']}")
            page.goto(frame["url"])
            page.wait_for_timeout(1800)
            
            # Full Dev Studio Workbench screenshot
            page.screenshot(path=out_path)
            size_kb = os.path.getsize(out_path) / 1024
            print(f"Saved {frame['name']} ({size_kb:.1f} KB)")
            captured_paths.append(out_path)
            
            # If outpatient visits (first frame), also capture an isolated crisp crop of the card
            if frame["name"] == "01_outpatient_visits.png":
                card_elem = page.locator("#kpi-card-container")
                if card_elem.count() > 0:
                    card_preview_path = os.path.join(DOCS_IMAGES, "kpi_card_showcase.png")
                    card_elem.screenshot(path=card_preview_path)
                    print(f"Saved isolated card preview: {card_preview_path}")
                    
                    # Update src/images/thumbnail.png and example.png
                    img_card = Image.open(card_preview_path).convert("RGB")
                    thumb_path = os.path.join(SRC_IMAGES, "thumbnail.png")
                    example_path = os.path.join(SRC_IMAGES, "example.png")
                    img_card.save(thumb_path, "PNG", optimize=True)
                    # example.png can be the full workbench or card
                    full_wb = Image.open(out_path).convert("RGB")
                    full_wb.save(example_path, "PNG", optimize=True)
                    print(f"Updated {thumb_path} and {example_path}")
                    
            time.sleep(0.3)
            
        browser.close()
        
    return captured_paths

def generate_gif_and_assets(captured_paths):
    gif_path = os.path.join(DOCS_IMAGES, "dev_studio_demo.gif")
    preview_png = os.path.join(DOCS_IMAGES, "kpi_comparison_preview.png")
    
    # Save the main outpatient visits workbench as the primary visual preview
    main_img = Image.open(captured_paths[0]).convert("RGB")
    main_img.save(preview_png, "PNG", optimize=True)
    print(f"Saved preview photo: {preview_png}")
    
    print(f"Compiling animated GIF demo: {gif_path}...")
    target_size = (1280, 800)
    pil_frames = []
    
    for path in captured_paths:
        img = Image.open(path).convert("RGB")
        resized = img.resize(target_size, Image.Resampling.LANCZOS)
        # 256 colors adaptive palette
        quantized = resized.quantize(colors=256, method=Image.Resampling.LANCZOS)
        pil_frames.append(quantized)
        
    # Frame duration: 2600ms per frame
    durations = [2600, 2600, 2600, 2600]
    
    pil_frames[0].save(
        gif_path,
        save_all=True,
        append_images=pil_frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )
    
    gif_kb = os.path.getsize(gif_path) / 1024
    print(f"GIF compiled successfully: {gif_path} ({gif_kb:.1f} KB)")

if __name__ == "__main__":
    paths = capture_frames()
    if paths:
        generate_gif_and_assets(paths)
        print("All visual assets generated successfully!")
