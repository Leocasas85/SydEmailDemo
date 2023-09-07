async function smoothScroll(pos, duration = 500) {
    return new Promise(resolve => {
        const startPos = window.pageYOffset;
        let startTime = null;

        function animateScroll(currentTime) {
            if (startTime === null) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const ease = elapsedTime / duration;
            const distance = pos - startPos;

            window.scrollTo(0, startPos + (distance * ease));

            if (elapsedTime < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                resolve();
            }
        }

        window.requestAnimationFrame(animateScroll);
    });
}

async function extractEmailsFrom(url) {
    const response = await fetch(url);
    const content = await response.text();
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return content.match(emailPattern) || [];
}

async function retrieveEmailsFrom(urls) {
    const emailData = [];

    for (let url of urls) {
        console.log(`Retrieving emails from: ${url}`);
        await smoothScroll(0);
        await new Promise(r => setTimeout(r, 1000));
        const emails = await extractEmailsFrom(url);
        emailData.push({ url, emails });
    }

    return emailData;
}

function saveAsCSV(data) {
    const csvFormat = [
        'URL,Emails',
        ...data.map(entry => `"${entry.url}","${entry.emails.join(', ')}"`)
    ].join('\n');

    const csvBlob = new Blob([csvFormat], { type: 'text/csv;charset=utf-8;' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(csvBlob);
    downloadLink.download = 'emails_output.csv';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Sample usage:
const userInput = prompt("List URLs (separate by newline):");
const urlList = userInput.split("\n").map(url => url.trim());

retrieveEmailsFrom(urlList)
    .then(emailData => {
        console.log('Finished retrieving emails.');
        saveAsCSV(emailData);
    })
    .catch(err => {
        console.error('Error encountered:', err);
    });
