import { expect, test, type Locator } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 860 },
];

for (const viewport of viewports) {
  test(`3D surface renders and moves on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.locator('#espaco3d').scrollIntoViewIfNeeded();

    const canvas = page.locator('.surface-host canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(700);

    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(viewport.name === 'mobile' ? 300 : 700);
    expect(box?.height).toBeGreaterThan(viewport.name === 'mobile' ? 320 : 470);

    await expect
      .poll(async () => (await readCanvasSignature(canvas)).nonTransparent, {
        message: 'Three.js canvas should contain rendered pixels',
        timeout: 5_000,
      })
      .toBeGreaterThan(900);

    const first = await readCanvasSignature(canvas);
    expect(first.colorSpread).toBeGreaterThan(35);

    await expect
      .poll(async () => (await readCanvasSignature(canvas)).hash, {
        message: 'Three.js canvas should animate between frames',
        timeout: 3_000,
      })
      .not.toBe(first.hash);

    await page.screenshot({
      path: `test-results/${viewport.name}-surface.png`,
      fullPage: false,
    });
  });
}

async function readCanvasSignature(canvas: Locator) {
  return canvas.evaluate((node: HTMLCanvasElement) => {
    const gl = node.getContext('webgl2') ?? node.getContext('webgl');
    if (!gl) {
      return { hash: 0, nonTransparent: 0, colorSpread: 0 };
    }

    const width = node.width;
    const height = node.height;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let hash = 2166136261;
    let nonTransparent = 0;
    let minChannel = 255;
    let maxChannel = 0;
    const stride = Math.max(4, Math.floor(pixels.length / 5000 / 4) * 4);

    for (let index = 0; index < pixels.length; index += stride) {
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];
      if (a > 0 && (r > 0 || g > 0 || b > 0)) {
        nonTransparent += 1;
      }
      minChannel = Math.min(minChannel, r, g, b);
      maxChannel = Math.max(maxChannel, r, g, b);
      hash ^= r + (g << 8) + (b << 16) + (a << 24);
      hash = Math.imul(hash, 16777619);
    }

    return {
      hash: hash >>> 0,
      nonTransparent,
      colorSpread: maxChannel - minChannel,
    };
  });
}
