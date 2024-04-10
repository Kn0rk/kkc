import { getSelectionContextSwitcher } from "../TmpSelectionContext";
import { getSecondaryCursor } from "../handler";


export function cutAction(){

    // 
    const cursor = getSecondaryCursor(false);

    const context = getSelectionContextSwitcher();
    if(context.isSet){
        
    }


}