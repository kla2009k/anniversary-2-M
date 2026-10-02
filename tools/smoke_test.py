"""Optional local visual regression/smoke test; requires Python Playwright + Chrome."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-output'
OUT.mkdir(exist_ok=True)
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
URL = 'http://localhost:5173/'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=CHROME, args=['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--disable-gpu-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 800}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(error.stack or str(error)))
    failed = []
    page.on('requestfailed', lambda request: failed.append(request.url))
    page.goto(URL, wait_until='networkidle')
    for clip in ['tape','box','paper','wrapper','leaf','lid','jewelry','bag']:
        response=page.request.get(f'{URL}foley/{clip}.mp3')
        assert response.status==200 and len(response.body())>1000, f'Foley clip failed: {clip}'
    page.get_by_role('button', name='รับพัสดุอีกหนึ่งชิ้น →').wait_for()
    page.screenshot(path=str(OUT/'intro.png'))
    page.get_by_role('button', name='รับพัสดุอีกหนึ่งชิ้น →').click()
    page.get_by_role('button', name='กรีดเทป').click()
    page.wait_for_timeout(650)
    page.screenshot(path=str(OUT/'cutter-cutscene.png'))
    page.get_by_role('button', name='เปิดกล่อง').wait_for()
    page.get_by_role('button', name='เปิดกล่อง').click()
    page.wait_for_timeout(450)
    page.screenshot(path=str(OUT/'box-opening.png'))
    page.get_by_text('0 / 8 ชิ้น').wait_for()
    page.locator('.asset-loading').wait_for(state='hidden')
    page.screenshot(path=str(OUT/'parcel-open.png'))
    names = ['กำไลปี่เซียะ','โรตีกรอบ','ซองปากกาหนังสีแดง','ร้านกาแฟจันทร์เต็มดวงในคืนไร้จันทร์','อินทผาลัมอบแห้ง','ขนมสตรอว์เบอร์รี่เคลือบช็อกโกแลต','ข้าวเม่าห่อใบตอง','ลูกอมนมซองแดง']
    for index,name in enumerate(names):
        print('INSPECT',name,flush=True)
        page.locator(f'button[title="{name}"]').click()
        page.locator('.object-action').click()
        page.wait_for_timeout(180)
        page.screenshot(path=str(OUT/f'item-{index+1:02d}.png'))
        page.get_by_role('button',name='วางของกลับลงกล่อง').click()
    page.get_by_text('8 / 8 ชิ้น').wait_for()
    page.locator('button[title="รูปนักเรียนที่ลืมส่ง"]').click()
    page.get_by_alt_text('รูปนักเรียนของต้นที่ลืมใส่พัสดุ').wait_for()
    page.get_by_text('01 / 16').wait_for()
    for _ in range(15):
        page.get_by_role('button',name='เปิดใบต่อไป →').click()
    page.get_by_text('16 / 16').wait_for()
    page.locator('.object-action').click()
    page.wait_for_timeout(250)
    page.screenshot(path=str(OUT/'forgotten-photo.png'))
    page.get_by_role('button',name='วางของกลับลงกล่อง').click()
    page.locator('.fiction-shelf summary').click()
    for name in ['ปลาติดเบ็ด','เคสใสในตำนาน','ตั๋วขอคุยหลังสอบ','จอยเกมของลูกในจินตนาการ','เหรียญฟังเสียงแล้วฮีล']:
        page.locator(f'button[title="{name}"]').click()
        page.locator('.object-action').click()
        page.wait_for_timeout(220)
        page.screenshot(path=str(OUT/f'fiction-{name}.png'))
        page.get_by_role('button',name='วางของกลับลงกล่อง').click()
    page.get_by_role('button',name='เปิดของชิ้นสุดท้าย →').click()
    page.get_by_role('heading',name='สุขสันต์วันครบรอบสองเดือนนะแฟน').wait_for()
    page.screenshot(path=str(OUT/'ending.png'))
    resources=page.evaluate('performance.getEntriesByType("resource").map(x => x.name)')
    print('VISITED',len(names)+1+5,'NOTES_READ',16,'REAL_FOLEY_VERIFIED',8,'TEXTURES_LOADED',sum('/textures/' in x for x in resources))
    print('PAGE_ERRORS',errors)
    print('REQUEST_FAILED',failed)
    browser.close()
    if errors: raise SystemExit(1)
