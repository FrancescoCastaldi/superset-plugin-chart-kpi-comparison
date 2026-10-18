import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()

        print("[TEST] Navigating to http://localhost:5175/ ...")
        await page.goto("http://localhost:5175/", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Locate big value element
        # It's inside the chart card, a span with formattedPrimary text
        big_val = page.locator("header + div div:has(> span[title]) span[title]").first

        initial_font_family = await big_val.evaluate("el => window.getComputedStyle(el).fontFamily")
        initial_font_size = await big_val.evaluate("el => window.getComputedStyle(el).fontSize")
        initial_font_weight = await big_val.evaluate("el => window.getComputedStyle(el).fontWeight")

        print(f"[INITIAL] fontFamily: {initial_font_family}")
        print(f"[INITIAL] fontSize: {initial_font_size}")
        print(f"[INITIAL] fontWeight: {initial_font_weight}")

        # 1. Test Font Family Change: Montserrat
        print("\n--- Test 1: Changing Font Family to Montserrat ---")
        font_select = page.locator("select").nth(1) # Scenario is 0, Font family is 1
        await font_select.select_option("Montserrat")
        await page.wait_for_timeout(500)
        montserrat_family = await big_val.evaluate("el => window.getComputedStyle(el).fontFamily")
        print(f"[RESULT] fontFamily after Montserrat select: {montserrat_family}")
        assert "Montserrat" in montserrat_family, f"Expected Montserrat in {montserrat_family}"

        # Check that Google Fonts link was injected into head
        link_href = await page.evaluate("() => document.getElementById('kpi-font-montserrat')?.href || ''")
        print(f"[LINK] Injected font link: {link_href}")
        assert "Montserrat" in link_href, f"Expected Montserrat in link href: {link_href}"

        # 2. Test Font Family Change: Oswald
        print("\n--- Test 2: Changing Font Family to Oswald ---")
        await font_select.select_option("Oswald")
        await page.wait_for_timeout(500)
        oswald_family = await big_val.evaluate("el => window.getComputedStyle(el).fontFamily")
        print(f"[RESULT] fontFamily after Oswald select: {oswald_family}")
        assert "Oswald" in oswald_family, f"Expected Oswald in {oswald_family}"

        # 3. Test Font Size Preset: Large (48px)
        print("\n--- Test 3: Changing Font Size to Large (48px) ---")
        large_btn = page.locator("button:has-text('Large (48px)')")
        await large_btn.click()
        await page.wait_for_timeout(300)
        large_size = await big_val.evaluate("el => window.getComputedStyle(el).fontSize")
        print(f"[RESULT] fontSize after Large preset: {large_size}")
        assert large_size == "48px", f"Expected 48px, got {large_size}"

        # 4. Test Font Size Preset: XLarge (64px)
        print("\n--- Test 4: Changing Font Size to XLarge (64px) ---")
        xlarge_btn = page.locator("button:has-text('XLarge (64px)')")
        await xlarge_btn.click()
        await page.wait_for_timeout(300)
        xlarge_size = await big_val.evaluate("el => window.getComputedStyle(el).fontSize")
        print(f"[RESULT] fontSize after XLarge preset: {xlarge_size}")
        assert xlarge_size == "64px", f"Expected 64px, got {xlarge_size}"

        # 5. Test Font Size Preset: Small (24px)
        print("\n--- Test 5: Changing Font Size to Small (24px) ---")
        small_btn = page.locator("button:has-text('Small (24px)')")
        await small_btn.click()
        await page.wait_for_timeout(300)
        small_size = await big_val.evaluate("el => window.getComputedStyle(el).fontSize")
        print(f"[RESULT] fontSize after Small preset: {small_size}")
        assert small_size == "24px", f"Expected 24px, got {small_size}"

        # 6. Test Font Weight: Light (300) and Black (900)
        print("\n--- Test 6: Changing Font Weight to Light (300) and Black (900) ---")
        weight_select = page.locator("select").nth(2)
        await weight_select.select_option("300")
        await page.wait_for_timeout(300)
        light_weight = await big_val.evaluate("el => window.getComputedStyle(el).fontWeight")
        print(f"[RESULT] fontWeight after 300: {light_weight}")
        assert light_weight == "300", f"Expected 300, got {light_weight}"

        await weight_select.select_option("900")
        await page.wait_for_timeout(300)
        black_weight = await big_val.evaluate("el => window.getComputedStyle(el).fontWeight")
        print(f"[RESULT] fontWeight after 900: {black_weight}")
        assert black_weight == "900", f"Expected 900, got {black_weight}"

        # Take a visual screenshot
        await page.screenshot(path="docs/images/typography_verified.png")
        print("\n[SUCCESS] All live typography tests passed! Screenshot saved to docs/images/typography_verified.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
