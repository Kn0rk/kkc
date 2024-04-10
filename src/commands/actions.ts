import * as vscode from 'vscode';
import { clearSelection } from '../handler';
import { getSelectionContextSwitcher } from "../TmpSelectionContext";

let tested_actions = [
    "editor.action.clipboardCutAction",
    "editor.action.clipboardPasteAction",
    "editor.action.clipboardCopyAction"
];


export async function selectActionReset(action:string){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
       vscode.commands.executeCommand(action).then(
        ()=>{
            selection.reset();
            clearSelection();
        }
       );
    }
}


export async function selectAction(action:string){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
       await vscode.commands.executeCommand(action).then(
        ()=>{
            clearSelection();
        }
       );
    }
}

export async function selectActionResetAction(actions:string[]){
    let selection = getSelectionContextSwitcher();
    if( selection.isSet){
       await vscode.commands.executeCommand(actions[0]);
    }
    selection.reset();
    await vscode.commands.executeCommand(actions[1]);
    clearSelection();
}

