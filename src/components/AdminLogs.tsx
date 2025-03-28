import { useState, useCallback, useEffect } from 'react';
import api from "../hooks/useAxiosInstance";
import { motion } from "framer-motion";
import { Table, Header, HeaderRow, Body, HeaderCell, Cell, Row, useCustom } from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { DayPicker, DateRange } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { IoMdSearch } from "react-icons/io";
import { usePagination } from "@table-library/react-table-library/pagination";
import { MdOutlineCleaningServices } from "react-icons/md";
import '../styles/AdminLogs.css';

interface ParamsData {
    search: string | null;
    page: number;
    start: string | null;
    end: string | null;
}

interface UserData {
    full_name: string;
    role: string;
    email: string;
}

interface LogsData {
    id: string;
    created_at: string;
    event_type: EventType;
    event_details: string;
    user: UserData;
}

interface EventType {
    code: string;
}

const AdminLogs = () => {

    const INITIAL_PARAMS = {
        search: "",
        page: 1,
        startDate: "",
        endDate: ""
    }

    const [dateSelected, setDateSelected] = useState<DateRange | undefined>(); 
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState({
        nodes: [],
        totalPages: 0
    })

    const [search, setSearch] = useState(INITIAL_PARAMS.search)
    const [start, setStart] = useState(INITIAL_PARAMS.startDate);
    const [end, setEnd] = useState(INITIAL_PARAMS.endDate)

    const handleSearch = () => {
        fetchData({
            search: search,
            page: 1,
            start,
            end
        })
        pagination.fns.onSetPage(1);
    }

    useCustom("search", data, {
        state: { search }
    })

    const fetchData = useCallback(async (params: ParamsData) => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        var baseUrl = `/admin/logs?term=${params.search}&page=${params.page}` 
        if (params.start) {
            baseUrl += `&start_date=${params.start}&client_timezone=${timeZone}`
        }
        if (params.end && params.start !== params.end){
            baseUrl += `&end_date=${params.end}`
        }
        const response = await api.get(baseUrl)
        console.log(response.data)
        setData({
            nodes: response.data.data,
            totalPages: response.data.last_page
        })
    }, [])

    useEffect(() => {
        fetchData({
            search: INITIAL_PARAMS.search,
            page: INITIAL_PARAMS.page,
            start,
            end
        })
    }, [fetchData])

    const onChangePagination = (_action: any, state: any) => {
        fetchData({
            search,
            page: state.page,
            start,
            end
        })
    }

    const pagination = usePagination(
        data,
        {
            state: {
                page: INITIAL_PARAMS.page
            },
            onChange: onChangePagination
        },
        {
            isServer: true
        }
    )

    const theme = useTheme([
        getTheme(),
        {
            HeaderRow: `
                background-color: var(--primary-blue);
                color: var(--white);
            `,
            Row: `
                &:nth-of-type(odd) {
                    background-color: var(--table-odd);
                }
                &:nth-of-type(even) {
                    background-color: var(--table-even);
                }
                &:hover {
                    background-color: rgba(14, 93, 157, 0.05);
                }
            `,
            Cell: `
                padding: 0.875rem 1rem;
                font-size: 0.875rem;
                color: var(--gray-dark);
            `,
            HeaderCell: `
                padding: 1rem;
                font-weight: 500;
                font-size: 0.875rem;
            `,
        },
    ]);

    const handleSelectDay = (newSelected: DateRange | undefined) => {
        if (newSelected?.from && newSelected?.to) {
            const from = new Date(newSelected.from);
            const fromString = from.toISOString().split("T")[0];
            const to = new Date(newSelected.to);
            const toString = to.toISOString().split("T")[0];
            fetchData({
                search,
                page: 1,
                start: fromString,
                end: toString
            });
        }
        setDateSelected(newSelected);
    };

    const handleShowCalendar = () => {
        setIsOpen(!isOpen);
    }



    const mapDateInput = () => {
        if (dateSelected?.from) {
            if (dateSelected.from.toLocaleDateString() !== dateSelected.to?.toLocaleDateString()) {
                return `${dateSelected.from.toLocaleDateString()} - ${dateSelected.to?.toLocaleDateString()}`;
            }
            return dateSelected.from.toLocaleDateString();
        }
        return '';
    };

    const handleCleanFilters = () => {
        setSearch(INITIAL_PARAMS.search);
        setStart(INITIAL_PARAMS.startDate);
        setEnd(INITIAL_PARAMS.endDate);
        setDateSelected(undefined); 
        fetchData({
            search: INITIAL_PARAMS.search,
            page: 1,
            start: INITIAL_PARAMS.startDate,
            end: INITIAL_PARAMS.endDate
        });
        pagination.fns.onSetPage(1);
        setIsOpen(false);
    }

    return (
        <motion.div
            className="logs-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="logs-filters-container">
                <div className="input-admin-container">
                    <input 
                        className="inputs-logs"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar..."
                    />
                    <IoMdSearch onClick={handleSearch} className="search-icon-admin"/>
                </div>
                <div className="day-picker-container">
                    <input 
                        className="inputs-logs"
                        value={mapDateInput()}
                        onClick={handleShowCalendar}
                        placeholder="Selecciona una fecha"
                        readOnly
                    />
                    {isOpen && (
                        <div className="date-picker-popup">
                            <DayPicker
                                mode="range"
                                selected={dateSelected}
                                onSelect={handleSelectDay}
                                locale={es}
                            />
                        </div>
                    )}
                </div>
                <button 
                    className="clean-filters-btn"
                    onClick={handleCleanFilters}
                >
                    <MdOutlineCleaningServices className="clean-filters-icon"/>
                </button>
            </div>
            <Table data={data} theme={theme} pagination={pagination}>
                {(tableList: LogsData[]) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCell>Fecha</HeaderCell>
                                <HeaderCell>Tipo de evento</HeaderCell>
                                <HeaderCell>Detalle</HeaderCell>
                                <HeaderCell>Nombre completo</HeaderCell>
                                <HeaderCell>Rol</HeaderCell>
                                <HeaderCell>Correo</HeaderCell>
                            </HeaderRow>
                        </Header>
                        <Body>
                            {tableList.map((item) => (
                                <Row key={item.id} item={item}>
                                    <Cell>{item.created_at}</Cell>
                                    <Cell>{item.event_type.code}</Cell>
                                    <Cell>{item.event_details}</Cell>
                                    <Cell>{item.user.full_name}</Cell>
                                    <Cell>{item.user.role}</Cell>
                                    <Cell>{item.user.email}</Cell>
                                </Row>
                            ))}
                        </Body>
                    </>
                )}
            </Table>

            <div className="page-selector-container">
                {Array(data.totalPages).fill(null).map((_, index) => (
                    <button
                        key={index}
                        className={`page-selector-btns ${pagination.state.page === index + 1 ? "selected-page" : ""}`}
                        onClick={() => pagination.fns.onSetPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </motion.div>
    )
}

export default AdminLogs;
