import * as vscode from 'vscode';
import { DecoProto, createDecoration } from './createDecorations';
import { getPrimaryCursor, getSecondaryCursor, setHat } from '../handler';


let solid: vscode.TextEditorDecorationType|null = null;
let double: vscode.TextEditorDecorationType|null = null;

export function decoration():void{

	
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}
	const cur = getPrimaryCursor();
	if(!cur){
		return;
	}

	// remove old hats
	if (solid){
		solid.dispose();
	}
	solid = vscode.window.createTextEditorDecorationType({
		borderWidth: '2px 0px 0px 0px',
		borderStyle: 'solid',
	});


	if (double){
		double.dispose();
	}
	double = vscode.window.createTextEditorDecorationType({
		borderWidth: '3px 0px 0px 0px',
		borderStyle: 'double',
	}); 
	
	const deco = createDecoration(activeEditor.document,cur.pos);
	deco.forEach((deco:DecoProto)=>{
		setHat(deco.deco,deco.hat);
	});
	
	

	const solidDecor: vscode.DecorationOptions[] = [];
	const doubleDecor: vscode.DecorationOptions[] = [];

	for ( let i = 0; i<deco.length;i++){
		const offset = deco[i].hat.charOffset;
		const startPos = activeEditor.document.positionAt(offset);
		const endPos = activeEditor.document.positionAt(offset + 1);

		const decoration = { range: new vscode.Range(startPos, endPos) };
		switch (deco[i].deco.style){
			case "double":
				doubleDecor.push(decoration);
				break;
			case "solid":
				solidDecor.push(decoration);
				break;
		}
	}
	
	activeEditor.setDecorations(solid, solidDecor);
	activeEditor.setDecorations(double, doubleDecor);
}