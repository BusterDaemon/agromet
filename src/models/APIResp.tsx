export interface IAPIResp {
    STATION: string,
    DATE: string,
    WND: string,
    CIG: string,
    VIS: string,
    TMP: string,
    DEW: string,
    AA1: string | undefined,
    GA1: string | undefined,
    GE1: string | undefined,
    GF1: string | undefined,
    IA1: string | undefined,
    MW1: string | undefined
}

export interface IAPIRespData {
    data: IAPIResp[]
}