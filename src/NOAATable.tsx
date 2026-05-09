import { useState } from "react";
import type { IAPIResp, IAPIRespData } from "./models/APIResp";

export function NOAATable({ data }: IAPIRespData) {
    if (data.length == 0) {
        return (
            <div></div>
        )
    }
    const [minTemp, setMinTemp] = useState<number[]>([])
    const [precip, setPrecip] = useState<number>(0)

    // data.map((d) => { })
    return (
        <table>
            <tr>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
                <th>9</th>
                <th>10</th>
                <th>11</th>
                <th>12</th>
            </tr>
            {
                data.map((d) => {
                    const date = new Date(d.DATE)
                    return (
                        <tr>
                            <td>{d.AA1}</td>
                            <td>{d.CIG}</td>
                            <td>{date.toLocaleString()}</td>
                            <td>{d.DEW}</td>
                            <td>{d.GA1}</td>
                            <td>{d.GE1}</td>
                            <td>{d.GF1}</td>
                            <td>{d.IA1}</td>
                            <td>{d.MW1}</td>
                            <td>{d.STATION}</td>
                            <td>{d.TMP}</td>
                            <td>{d.VIS}</td>
                            <td>{d.WND}</td>
                        </tr>
                    )
                })}
        </table>
    )
}