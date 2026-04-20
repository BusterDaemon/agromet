export interface Row {
    CALL_SIGN: string;
    CIG: string;
    DATE: string;
    DEW: string;
    GE1: string;
    GF1: string;
    NAME: string;
    QUALITY_CONTROL: string;
    REPORT_TYPE: string;
    SOURCE: string;
    STATION: string;
    TMP: string;
    VIS: string;
    WND: string;
}
export function DrawTable(data: Row[]) {
    console.log("12345")
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>CALL_SIGN</th>
                        <th>CIG</th>
                        <th>DATE</th>
                        <th>DEW</th>
                        <th>GE1</th>
                        <th>GF1</th>
                        <th>NAME</th>
                        <th>QUALITY_CONTROL</th>
                        <th>REPORT_TYPE</th>
                        <th>SOURCE</th>
                        <th>STATION</th>
                        <th>TMP</th>
                        <th>VIS</th>
                        <th>WND</th>
                    </tr>
                </thead>
                {data.length > 1 && <tbody>
                    {data.map((item) => (
                        <tr>
                            <td>{item.CALL_SIGN}</td>
                            <td>{item.CIG}</td>
                            <td>{item.DATE}</td>
                            <td>{item.DEW}</td>
                            <td>{item.GE1}</td>
                            <td>{item.GF1}</td>
                            <td>{item.NAME}</td>
                            <td>{item.QUALITY_CONTROL}</td>
                            <td>{item.REPORT_TYPE}</td>
                            <td>{item.SOURCE}</td>
                            <td>{item.STATION}</td>
                            <td>{item.TMP}</td>
                            <td>{item.VIS}</td>
                            <td>{item.WND}</td>
                        </tr>
                    ))}
                </tbody>}
            </table>
        </div >
    );
}



//data.length > 1 && 
//     }
// );