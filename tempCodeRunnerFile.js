 await page.evaluate(() => {
                const programSelect = document.querySelector('#Program');
                const option = new Option('Bachelor of Computer Engineering', 'Bachelor of Computer Engineering');
                programSelect.append(option);
                programSelect.value = 'Bachelor of Computer Engineering';
            });