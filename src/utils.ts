import './augmentations/global'

export const sumBool = (bools: boolean[]) => bools.reduce((acc, val) => acc + val.asnumber, 0);
