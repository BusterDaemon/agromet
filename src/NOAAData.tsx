import React, { useState, useCallback, Component } from "react"
import type { Row } from './tablerow';
import { DrawTable } from "./tablerow";
import type { JSX } from "react/jsx-runtime";
export function NOAAData() {
    let data: Row[] = [{
        CALL_SIGN: "",
        CIG: "",
        DATE: "",
        DEW: "",
        GE1: "",
        GF1: "",
        NAME: "",
        QUALITY_CONTROL: "",
        REPORT_TYPE: "",
        SOURCE: "",
        STATION: "",
        TMP: "",
        VIS: "",
        WND: ""
    }];
    // Читаем начальные параметры из URL (один раз при монтировании)
    const initialParams = new URLSearchParams(window.location.search)

    // Контролируемые инпуты
    const [befDate, setBefDate] = useState<string>(initialParams.get("befDate") || "")
    const [endDate, setEndDate] = useState<string>(initialParams.get("endDate") || "")
    const [stationID, setStationID] = useState<string>(initialParams.get("stationID") || "")

    // Состояния запроса
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // Валидация + запрос
    const fetchData = useCallback(async () => {
        // 1. Базовая валидация
        if (!befDate || !endDate) {
            setError("Нельзя указывать пустые даты!")
            return
        }
        if (!stationID) {
            setError("Укажите идентификатор метеостанции!")
            return
        }

        const meteoIDRegexp = /^[aA0-zZ9]{6}\d{5}$/
        if (!meteoIDRegexp.test(stationID)) {
            setError("Указан неверный ID метеостанции!")
            return
        }

        // 2. Валидация диапазона дат
        const start = new Date(befDate)
        const end = new Date(endDate)
        if (start > end) {
            setError("Дата начала не может быть позже даты конца")
            return
        }

        // 3. Формируем запрос
        setLoading(true)
        setError(null)

        try {
            const url = `https://www.ncei.noaa.gov/access/services/data/v1?dataset=global-hourly&dataTypes=WND,TMP,DEW,STATION,DATE,NAME,REPORT_TYPE,CIG,VIS,DEW,AA1,GE1,GF1,IA1,MW1&stations=${stationID}&startDate=${befDate}&endDate=${endDate}&includeAttributes=true&format=json&units=metric`

            const res = await fetch(url)
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`)
            }

            data = await res.json()
            //console.log(data)
            // Здесь можно сохранить данные в state, если нужно отобразить

        } catch (err) {
            setError(err instanceof Error ? err.message : "Что-то пошло не так")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [befDate, endDate, stationID]) // Пересоздаётся только при изменении параметров

    // Обновляем URL при изменении параметров (опционально, но удобно)
    const updateURL = useCallback(() => {
        const params = new URLSearchParams()
        if (befDate) params.set("befDate", befDate)
        if (endDate) params.set("endDate", endDate)
        if (stationID) params.set("stationID", stationID)
        window.history.replaceState({}, "", `?${params.toString()}`)
    }, [befDate, endDate, stationID])

    // Обработчик кнопки
    const handleGo = () => {
        updateURL()   // синхронизируем с URL
        fetchData()   // делаем запрос
        // DrawTable(data)

    }
    return (
        <div className="noaadiv">
            <div className="noaadate">
                <div className="noaadateinput">
                    <span>Начальная дата:</span>
                    <input
                        type="date"
                        value={befDate}
                        onChange={(e) => setBefDate(e.target.value)}
                    />
                </div>
                <div className="noaadateinput">
                    <span>Конечная дата:</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="noaadateinput">
                    <span>Идентификатор метеостанции:</span>
                    <input
                        type="text"
                        value={stationID}
                        onChange={(e) => setStationID(e.target.value)}
                        placeholder="27962099999"
                    />
                </div>
                <button
                    onClick={handleGo}
                    disabled={loading}
                >
                    {loading ? "Загрузка..." : "Запрос"}
                </button>
            </div>

            {/* Отображение ошибок */}
            {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
            {/* Здесь можно добавить отображение данных, если нужно */}

        </div>

    )
}