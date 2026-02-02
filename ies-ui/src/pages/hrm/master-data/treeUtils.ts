
function normalize(text: string): string {
    return text
        .trim()
        .replace(/[^a-zA-Z\s]/g, '')
        .toUpperCase();
}

function generateBaseCode(name: string): string {
    const clean = normalize(name);
    const words = clean.split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 3);
    }

    return words.map(w => w[0]).join('').substring(0, 3);
}

export function generateFullCode(name: string, lastNumber: number): string {
    const base = generateBaseCode(name);
    const next = lastNumber + 1;
    return `${base}${next.toString().padStart(3, '0')}`;
}


export function generate3LetterCode(text: string): string {
    if (!text) return 'XXX';

    const clean = text
        .trim()
        .replace(/[^A-Z\s]/gi, '')
        .toUpperCase();

    const words = clean.split(/\s+/).filter(Boolean);

    // Single word → first 3 letters
    if (words.length === 1) {
        const w = words[0];
        return w.padEnd(3, w[w.length - 1]).slice(0, 3);
    }

    // Multi-word
    const firstWord = words[0];
    const secondWord = words[1];

    let code = firstWord[0]; // A

    // Borrow strong consonant from first word
    const consonants = firstWord.slice(1).replace(/[AEIOU]/g, '');
    if (consonants.length > 0) {
        code += consonants[0]; // C
    }

    code += secondWord[0]; // P

    return code.padEnd(3, code[code.length - 1]).slice(0, 3);
}

