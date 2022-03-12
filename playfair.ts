/*
 * Copyright (c) 2022 Brandon Pacewic
 *
 * Developed and // tested by Brandon Pacewic
 * 
 * home.ts - Main file for web based playfair cipher solver
 */

const test = (x: any): void => {
    console.log(x);
}

// Set<string> where each string is of len 1
const createValidCharSet = (): Set<string> => {
    const alph = 'abcdefghijklmnopqrstuvwxyz';
    let charSet: Set<string> = new Set();

    for (let i = 0; i < alph.length; i++) {
        charSet.add(alph[i]);
    }

    return charSet;
}

const validateInput = (charSet: Set<string>, input: string): void => {
    for (let i = 0; i < input.length; i++) {
        console.assert(charSet.has(input[i]));
    }
}

// TODO: should define matrix type, this class is just a quick fix for matrix
// wrapping
interface rowColPair {
    row: number;
    col: number;
    limit: number;
}

class rowColPair {
    constructor(limit: number) {
        this.row = 0;
        this.col = 0;
        this.limit = limit;
    }

    getCol(): number {
        const before = this.col;
        this.col++;

        if (this.col === this.limit) {
            this.col = 0;
            this.row++;
        }

        return before;
    }

    getRow(): number {
        return this.row;
    }

}

const createMatrix = (key: string): string[][] => {
    const alph = 'abcdefghiklmnopqrstuvwxyz'; // Note no 'j'
    const matrixSize = Math.sqrt(alph.length);
    let usedChars: Set<string> = new Set();
    let matrix: string[][] = [[]];
    let rowCol = new rowColPair(matrixSize);

    for (let i = 0; i < key.length; i++) {
        if (usedChars.has(key[i])) { continue; }

        if (matrix.length <= rowCol.row) {
            matrix.push([]);
        }

        matrix[rowCol.getRow()][rowCol.getCol()] = key[i];
        usedChars.add(key[i]);
    }

    for (let i = 0; i < alph.length; i++) {
        if (usedChars.has(alph[i])) { continue; }

        if (matrix.length <= rowCol.row) {
            matrix.push([]);
        }

        matrix[rowCol.getRow()][rowCol.getCol()] = alph[i];
    }

    return matrix;
}

const encoder = (
    matrix: string[][], encoding: boolean, message: string
): string => {
    const matrixSize = matrix.length;
    let mapCharToCord: { [key: string]: number[] } = {};

    for (let row = 0; row < matrixSize; row++) {
        for (let cell = 0; cell < matrixSize; cell++) {
            mapCharToCord[matrix[row][cell]] = [row, cell];
        }
    }

    // test(mapCharToCord);

    // If the message len is not even the letter 'x' is added to make 
    // enough character pairs
    if (message.length % 2 !== 0) {
        message += 'x';
    }

    console.assert(message.length % 2 === 0);

    // test(message);

    // If any pair of chars is the same, the second one must be coverted
    // to 'x'. Alos at this step every 'j' must be replaced with an 'i'
    message.replace('j', 'i');

    // TODO: There should be a more time efficient way of doing this
    // Perhaps we should treat message as a array of string of len 1
    for (let i = 0; i < message.length; i += 2) {
        if (message[i] === message[i+1]) {
            message.replace(`${message[i]}${message[i]}`, `${message[i]}x`);
        }
    }

    let messageCords: number[][] = [];

    for (let i = 0; i < message.length; i++) {
        messageCords[i] = mapCharToCord[message[i]];
    }

    // test(message);
    // test(messageCords);

    // Mod in js works differently than expected should create a number between
    // 0 and y, but in js it can create a number between -y and y.
    // This is not what we want so it is redifined here
    const mod = (x: number, y: number) => ((x % y) + y) % y;

    // adjustment defines the movment needed to find the propper char in the 
    // matrix on the account of the starting pairs are in the same row/column
    const adjustment = (encoding) ? 1 : -1;
    let newCords: number[][] = [];

    for (let i = 0; i < messageCords.length; i += 2) {
        if (messageCords[i][0] === messageCords[i+1][0]) {
            newCords[i] = [
                messageCords[i][0],
                mod(messageCords[i][1] + adjustment, matrixSize)
            ];

            newCords[i+1] = [
                messageCords[i+1][0],
                mod(messageCords[i+1][1] + adjustment, matrixSize)
            ];
        }
        else if (messageCords[i][1] === messageCords[i+1][1]) {
            newCords[i] = [
                mod(messageCords[i][0] - adjustment, matrixSize),
                messageCords[i][1]
            ];

            newCords[i+1] = [
                mod(messageCords[i+1][0] - adjustment, matrixSize),
                messageCords[i+1][1]
            ];
        }
        else {
            // test('bettom');

            newCords[i] = [
                messageCords[i][0], messageCords[i+1][1]
            ];

            newCords[i+1] = [
                messageCords[i+1][0], messageCords[i][1]
            ];
        }
    }

    // test(newCords);

    let newMessage: string  = '';

    for (let i = 0; i < newCords.length; i++) {
        newMessage += matrix[newCords[i][0]][newCords[i][1]];
    }

    return newMessage;
}

// Main
(() => {
    const key = 'a';
    const message = 'a';
    const encoding = true;
    const matrix = createMatrix(key);
    const newMessage = encoder(matrix, encoding, message);

    // test(matrix);
    test(newMessage);
})();
