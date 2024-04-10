import { Model, Solution, solve } from "../ext/yalps";
import { HatCandidate } from "./splitDocument";
import * as vscode from 'vscode';




const styles = ["solid", "double"] as const;
export type Style = typeof styles[number];

const modes = ["shift", "replace"] as const;
export type Mode = typeof modes[number];


export type Decoration = {
    style: Style,
    character: string,
};


export type Hat = HatCandidate & { charOffset: number };


export function hatToEditor(hat: Hat): vscode.TextEditor {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw Error;
    }
    return editor;
}

export function hatToPos(hat: Hat): [vscode.Position, vscode.Position] {
    let editor = hatToEditor(hat);
    let start = editor.document.positionAt(hat.startOffset);
    let end = editor.document.positionAt(hat.endOffset);
    return [start, end];
}

function getAllDecos(): Decoration[] {
    const alphabet: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    const styles: ("solid" | "double")[] = ["solid", "double"];

    const decos: Decoration[] = [];
    for (let s of styles) {
        for (let char of alphabet) {
            const deco: Decoration = {
                style: s,
                character: char
            }
            decos.push(deco);
        }
    }

    return decos;
}

function getMatchingDeco(char: string, decos: Decoration[]): number {
    for (let i = 0; i < styles.length; i++) {
        let idx = decos.findIndex(
            deco => deco.character === char && deco.style === styles[i]
        );
        if (idx >= 0) {
            return idx;
        }

    }
    return -1;

}

export type DecoProto = {
    deco: Decoration,
    hat: Hat
};

const alphabet: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function valueLine(line: vscode.TextLine): number[] {

    const text = line.text;
    const center = Math.floor(text.length / 2);
    let values = Array(text.length).fill(-50);
    let afterEquals = 0;
    let inside = 0;


    const openingCharacters = ["{", "[", "(", '<',"\"", "'"];
    const closingCharacters = ["}", "]", ")", '>'];
    let counters = [0, 0, 0, 0,0,0];

    for (let i = 0; i < text.length; i++) {
        let a_center = 1 - Math.abs(center - i) / center;
        let currentChar = text[i];
        if (alphabet.indexOf(currentChar) >= 0) {
            values[i] += 100 * a_center + afterEquals + inside;
        }
        if (currentChar === "=") {
            afterEquals += 15;
        }
        // TODO reward inside parenthesis ...
        let closing = closingCharacters.indexOf(currentChar);
        let open = openingCharacters.indexOf(currentChar);
        if (closing !== -1) {
            counters[closing]--;
        } else if (open !== -1) {
            counters[open]++;
        }

        if(counters.some((n)=>{n>0;})){
            inside=20;
        }else{
            inside=0;
        }

    }
    return values;
}

class ValuePos {
    constructor(
        public val: number,
        public line: number,
        public off: number

    ) { }

}

function argsort(arr: number[], order: "forward" | "reverse" = "forward"): number[] {
    // Create an array of indices [0, 1, 2, ..., arr.length - 1]
    const indices = arr.map((val, index) => index);
    // Sort the indices based on the corresponding values in arr
    indices.sort((a, b) => arr[b] - arr[a]);
    return indices;
}

function charToAlphabetNumber(char: string): number {
    // Convert the character to lowercase for consistency
    const lowercaseChar = char.toLowerCase();
    // Get the Unicode code point of the lowercase character
    const codePoint = lowercaseChar.codePointAt(0);
    // Calculate the alphabet number (0-indexed), assuming ASCII characters
    const alphabetNumber = codePoint! - 'a'.codePointAt(0)!;
    return alphabetNumber;
}

export function createDecoration(text: vscode.TextDocument, cursorPos:vscode.Position): DecoProto[] {



    let counts: number[] = Array(alphabet.length).fill(0);
    let positions: { [id: string]: ValuePos[] } = {};
    for (let c of alphabet) {
        positions[c] = [];
    }

    for (let iLine = 0; iLine < text.lineCount; iLine++) {
        const line = text.lineAt(iLine);
        const values = valueLine(line);
        const order = argsort(counts, "reverse").slice(0, Math.floor(counts.length / 2));
        const valOrder = argsort(values);
        let choosen = [];

        let lineDistance = Math.abs(cursorPos.line - iLine);

        for (let ival of valOrder.slice(0, 10)) {
            if(values[ival]<0){
                break;
            }
            const c = line.
            text[ival];
            const iC = charToAlphabetNumber(c);
            if (order.indexOf(iC) !== -1) {
                counts[iC] += 1;
                positions[c].push(
                    {
                        line: iLine,
                        val: values[ival] - lineDistance,
                        off: ival
                    }
                );
                choosen.push(ival);
            }
        }

        for (let ival of valOrder.slice(0, 10)) {
            if (values[ival] < 0 || choosen.length > 5 || choosen.length >= valOrder.length){
                break;
            }
            if (choosen.indexOf(ival) === -1) {
                choosen.push(ival);
                const c = line.text[ival];
                const iC = charToAlphabetNumber(c);
                counts[iC] += 1;
                positions[c].push(
                    {
                        line: iLine,
                        val: values[ival],
                        off: ival
                    }
                );

            }
        }
        
    }


    // build constraints
    let constraints = new Map<string, any>();
    let variables: any = {};

    for (let c of alphabet) {
        for (let pos of positions[c]) {
            let id = pos.line + "&" + pos.off;
            let varVal = new Map<string, number>()
                .set(c, 1)
                .set("line" + pos.line, 1)
                .set("value", pos.val);
            variables[id] = varVal;
        };
        constraints.set(c,{max:2});
    }

    for (let i =0; i< text.lineCount;i++){
        constraints.set("line"+i,{max:1});
    }

    const model: Model = {
        direction: "maximize",
        objective: "value",
        constraints: constraints, // is an iterable
        variables: variables,
        integers: true // all variables are indicated as integer
      };
      
    const solution: Solution = solve(model);

    let res: DecoProto[]=[];

    let styles_count: number[] = Array(alphabet.length).fill(0);
    let styles:Style[]=["solid","double"];
    for (let s of solution.variables){
        const parts = s[0].split("&");
        const line = parseInt(parts[0]);
        const charoff = parseInt(parts[1]);
        const pos = new vscode.Position(line,charoff);

        const off = text.offsetAt(pos);
        const char = text.lineAt(line).text[charoff];

        const charIdx = charToAlphabetNumber(char);
        const style = styles[styles_count[charIdx]];
        styles_count[charIdx]+=1;




        res.push({
            deco:{
                character:char,
                style:style
            },
            hat:{
                charOffset:off,
                startOffset:off,
                endOffset:off,
                word:""
            }
        });

    }



    return res;

    // const decos = getAllDecos();

    // let result: DecoProto[] = [];
    // for (let i = 0; i< candidates.length; i++){
    //     const candidate = candidates[i];
    //     const word = text.substring(candidate.startOffset,candidate.endOffset);
    //     for (let j = 0;j<word.length;j++){
    //         let idx = getMatchingDeco(word.charAt(j),decos);
    //         if (idx >=0){
    //             const deco = decos[idx];
    //             let hat:Hat = {...candidate,charOffset:j};
    //             let res: DecoProto = {deco,hat};
    //             result.push(res);
    //             decos.splice(idx,1);
    //             break;
    //         }
    //     }
    // }

}