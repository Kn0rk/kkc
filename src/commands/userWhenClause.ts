import * as vscode from 'vscode';
import { getKeyboardHandler } from '../extension';


let userModes = new Map<string,boolean>();

export function setUserMode(namedArgs: any ) {
    let modeName = "kkc." + namedArgs.modeName;
    let mode = namedArgs.mode;
    userModes.set(modeName,mode);
    vscode.commands.executeCommand("setContext",modeName , mode);
    let handler = getKeyboardHandler();
    if(handler){
        let text = mode? "KKC":namedArgs.modeName;
        handler.setStatusBarText(text);
    }

}

