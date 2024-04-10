import * as vscode from 'vscode';
import { DecoProto, createDecoration } from './createDecorations';
import { setHat } from '../handler';


let solid: vscode.TextEditorDecorationType|null = null;
let double: vscode.TextEditorDecorationType|null = null;

export function decoration(context:vscode.ExtensionContext):void{

	
	const activeEditor = vscode.window.activeTextEditor;
	// activeEditor?.document.
	if (!activeEditor) {
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
	

	const text = activeEditor.document.getText();
	// const cursorOffset = activeEditor.selection.active;
    // const candidates = splitDocument(text,cursorOffset);
	const deco = createDecoration(activeEditor.document,activeEditor.selection.active);
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



	// const imageUri = vscode.Uri.joinPath(context.extensionUri, 'images/svg/line.svg');


// const smallNumberDecorationType = vscode.window.createTextEditorDecorationType"
// 	borderWidth: '1px 0px 0px 0px',
// 	borderStyle: 'solid',
// 	outline: '2px 0 0 0 solid black',
	
// 	// backgroundColor: 'rgba(0.7,0,0,0.1)',
// 	before:{
// 		// margin: '-0.5em -1em 0 0',
// 		height: "3em"
		
// 	},
// 	// borderStyle: 'dotted',
// 	// border: "top",
// 	overviewRulerColor: 'blue',
// 	overviewRulerLane: vscode.OverviewRulerLane.Right,
// 	// light: {
// 	// 	// this color will be used in light color themes
// 	// 	borderColor: 'darkblue',
// 	// 	before: {
// 	// 		contentIconPath: imageUri,
// 	// 		margin: `-0.5em -1em 0 0`,
// 	// 		width: '0.5em',
// 	// 		height: '1em',
// 	// 	  },
// 	// },
// 	// dark: {
// 	// 	// this color will be used in dark color themes
// 	// 	borderColor: 'lightblue'
// 	// },
// });