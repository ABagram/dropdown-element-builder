// components/code-preview.js

export function copyCode(appState) {
    navigator.clipboard.writeText(document.getElementById('generated-code').textContent).then(() => {
        const copyButton = document.getElementById('copy-button');
        copyButton.innerHTML = '<i class="bx bx-check"></i> Copied';
        setTimeout(() => {
            copyButton.innerHTML = '<i class="bx bx-copy"></i> Copy';
        }, 2000);
    });
}