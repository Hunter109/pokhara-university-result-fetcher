const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');
const { PDFDocument } = require('pdf-lib');

(async () => {
    const resultDir = path.resolve(__dirname, 'result');

    await fs.ensureDir(resultDir);

    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    const startSymbol = 1;

    const endSymbol = 100;




    const screenshotPaths = [];

    for (let symbol = startSymbol; symbol <= endSymbol; symbol++) {
        try {
            console.log(`Processing roll number: ${symbol}`);

            await page.goto('https://exam.pu.edu.np:9094/', { waitUntil: 'networkidle2' });

            await page.type('#Year', '2024', { delay: 50 });
            await page.select('#Academic_System', 'Fall');
            await page.select('#Semester', '7th');
            await page.select('#Exam_Type', 'Regular_Retake');
            await page.select('#Program', 'Bachelor of Computer Engineering');


            await page.type('#Symbol_Number', symbol.toString(), { delay: 50 });
            await page.type('#DOB', '2022-01-01', { delay: 50 });

            await page.click('input[type="submit"]');

            // Wait 2 seconds for the result div to load/render
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if result container exists
            const resultExists = await page.$('.container_card') !== null;
            if (resultExists) {
                const screenshotPath = path.join(resultDir, `result-${symbol}.png`);
                await page.screenshot({ path: screenshotPath, fullPage: true });
                screenshotPaths.push(screenshotPath);
                console.log(`Saved screenshot for roll number ${symbol}`);
            } else {
                console.log(`No result container found for roll number ${symbol}`);
            }

            // Wait 3 seconds between requests to avoid server overload or blocking
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
            console.error(`Error processing roll number ${symbol}:`, err.message);
        }
    }

    await browser.close();

    // Combine all screenshots into a single PDF
    if (screenshotPaths.length > 0) {
        const pdfDoc = await PDFDocument.create();

        for (const imgPath of screenshotPaths) {
            const imgBytes = await fs.readFile(imgPath);
            const img = await pdfDoc.embedPng(imgBytes);
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, {
                x: 0,
                y: 0,
                width: img.width,
                height: img.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(resultDir, 'combinedResult.pdf');
        await fs.writeFile(pdfPath, pdfBytes);

        console.log(`Combined PDF saved at: ${pdfPath}`);
    } else {
        console.log('No screenshots found to combine into PDF.');
    }
})();
