const { useState, useEffect } = require("react")


const Test = () => {
    const [curChunkIdx, setCurChunkIdx] = useState(0);
    const [curRowIdx, setCurRowIdx] = useState(0);

    const printVal = () => {
        console.log(curChunkIdx);
        console.log(curRowIdx);
    }

    useEffect(() => {
        if(curChunkIdx) {
            console.log(curChunkIdx);
            console.log(curRowIdx);
        }
    }, [curChunkIdx, curRowIdx])

    const onClickTest = () => {
        const ch_idx = curChunkIdx+1;
        const row_idx = curRowIdx+1;
        setCurChunkIdx(ch_idx);
        setCurRowIdx(row_idx);
    }

    return (
        <button onClick={onClickTest}>test</button>
    )
}

export default Test;