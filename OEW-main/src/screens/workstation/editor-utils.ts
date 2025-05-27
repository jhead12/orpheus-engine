import { clamp as originalClamp, cmdOrCtrl as originalCmdOrCtrl, isMacOS as originalIsMacOS } from "../../services/utils/general";
import { SortData as OriginalSortData } from "../../components/widgets/SortableList";
import { openContextMenu as originalOpenContextMenu } from "../../services/electron/utils";
import { debounce as originalDebounce } from "lodash";

// Re-export the utilities
export const clamp = originalClamp;
export const cmdOrCtrl = originalCmdOrCtrl;
export const isMacOS = originalIsMacOS;
export const openContextMenu = originalOpenContextMenu;
export const debounce = originalDebounce;
export type SortData = OriginalSortData;
