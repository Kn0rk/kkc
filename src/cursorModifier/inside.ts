import * as vscode from 'vscode';

import { getSecondaryCursor, setSecondaryCursor, setSecondarySelection } from '../handler';
import { TempCursor } from '../utils/structs';
import { getNextChar } from '../utils/iterateDocument';
import { getPreviousChar } from '../utils/iterateDocument';


export function byChar(dir: "next" | "prev", shift: "shift" | "replace" ="replace") {
    let cursor = getSecondaryCursor();
    if (cursor === null) {
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    let line = cursorPos.line;
    let nextPos: vscode.Position | null = null;
    if (dir === "next") {
        nextPos = getNextChar(editor.document, cursorPos);
    } else {
        nextPos = getPreviousChar(editor.document, cursorPos);
    }
    if (nextPos) {
        setSecondaryCursor(new TempCursor(nextPos, editor), shift);
    }
}


function charAt(pos: vscode.Position, doc: vscode.TextDocument): string {
    return doc.lineAt(pos.line).text.at(pos.character) ?? "";
}

export function insideAny(cursor: vscode.Position, document: vscode.TextDocument): vscode.Selection | null {

    const openingCharacters = ["{", "[", "(", '<'];
    const closingCharacters = ["}", "]", ")", '>'];
    let counters = [0, 0, 0, 0];

    const ambigousCharacters = ["\"", "'"];
    let ambigousCounter = [0, 0];
    let firstAmbPos: (vscode.Position | null)[] = [null, null];

    let lookBackPos = getPreviousChar(document, cursor);

    let openingPos = null;
    let closingCharacter = null;
    while (lookBackPos) {
        let currentChar = charAt(lookBackPos, document);
        let closing = closingCharacters.indexOf(currentChar);
        let open = openingCharacters.indexOf(currentChar);
        let amb = ambigousCharacters.indexOf(currentChar);

        if (closing !== -1) {
            counters[closing]++;
        } else if (open !== -1) {
            if (counters[open] === 0) {
                openingPos = lookBackPos;
                closingCharacter = closingCharacters[open];
                break;
            } else {
                counters[open]--;
            }
        } else if (amb !== -1) {
            ambigousCounter[amb]++;
            if (ambigousCounter[amb] === 1) {
                firstAmbPos[amb] = lookBackPos;
            }
        }
        lookBackPos = getPreviousChar(document, lookBackPos);  
    }

    if (ambigousCounter[0] % 2 === 1) {
        openingPos = firstAmbPos[0];
        closingCharacter = ambigousCharacters[0];
    } else if (ambigousCounter[1] % 2 === 1) {
        openingPos = firstAmbPos[1];
        closingCharacter = ambigousCharacters[1];
    }

    let lookForwardPos: vscode.Position|null = cursor;
    let closingPos = null;
    while( lookForwardPos){
        let currentChar = charAt(lookForwardPos,document);
        if( currentChar === closingCharacter){
            closingPos=lookForwardPos;
            break;
        }
        lookForwardPos = getNextChar(document,lookForwardPos);
    }


    if( openingPos && closingPos){
        return new vscode.Selection(getNextChar(document,openingPos)!,closingPos);
    }
    return null;
}

export function insideAnyWrap() {
    let cursor = getSecondaryCursor();
    if (cursor === null) {
        return;
    }
    let cursorPos = cursor.pos;
    let editor = cursor.editor;
    let selection = insideAny(cursorPos, editor.document);

    
    // // find the next bracket before and after the cursor
    // let openingChars = ["{","[","(",'<'];
    // let ambigous = ["\"","'"];

    // let beforeCursor = cursorPos;
    // let character;

    // let openingPos:vscode.Position|null=null;
    // let firstAmbigous:vscode.Position|null=null;


    // let ambigousCount=0;
    // while( openingPos === null){
    //     let prePos = getPreviousChar(editor.document,beforeCursor);
    //     if (prePos === null){
    //         break;
    //     }
    //     beforeCursor = prePos;            

    //     character = editor.document.lineAt(prePos.line).text.at(prePos.character)!;
    //     if( openingChars.includes(character)){
    //         openingPos=beforeCursor;
    //     }

    //     if (ambigous.includes(character)){
    //         ambigousCount+=1;
    //         if (ambigousCount === 1){
    //             firstAmbigous=prePos;
    //         }   
    //     }
    // }
    // if(openingPos === null){
    //     // todo error?
    //     return;
    // }

    // if ( ambigousCount % 2 ===1 && new PositionMath(openingPos).lessThan(new PositionMath(firstAmbigous!)) ){ 
    //     openingPos=firstAmbigous;
    // }
    // let openingCharacter = editor.document.lineAt(openingPos!.line).text.charAt(openingPos!.character);
    // let closing = ["}","]",")",'>'];
    // let closingCharacter="]";
    // if (openingChars.includes(openingCharacter)){
    //     closingCharacter = closing.at(openingChars.indexOf(openingCharacter))!;
    // }else{
    //     closingCharacter=openingCharacter;
    // }

    // beforeCursor =  cursorPos;
    // let closingPos:vscode.Position|null=null;
    // while(closingPos === null){
    //     let nextPos = getNextChar(editor,beforeCursor);
    //     if (nextPos === null){
    //         break;
    //     }
    //     beforeCursor = nextPos;
    //     character = editor.document.lineAt(beforeCursor.line).text.at(beforeCursor.character)!;

    //     if (character === closingCharacter){
    //         closingPos = beforeCursor;
    //     }
    // }
    if (selection) {
        setSecondarySelection(selection, editor);
    }

}