import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { useEffect, useCallback, useState } from 'react';
import api from '../hooks/useAxiosInstance';
import { Table, Header, HeaderRow, Body, HeaderCell, Cell, Row, useCustom } from "@table-library/react-table-library/table";
import { usePagination } from "@table-library/react-table-library/pagination";
import '../styles/AdminTable.css';
import { IoMdSearch } from "react-icons/io";
import { IoIosAddCircleOutline } from "react-icons/io";
// import { IoAlert, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import CreateUser from "./CreateUser";
import { AnimatePresence, motion } from 'framer-motion';
import { Bounce, ToastContainer, toast } from "react-toastify";

interface UsersList {
  search: string | null;
  page: number;
}

interface UserData {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  state: string;
  status: string;
}

interface DataType {
  nodes: UserData[],
  totalPages: number
}

const getStateCircle = (state: string) => {
  const stateClass = state === "ONLINE" ? "online" 
                  : state === "BREAK" ? "break" 
                  : state === "OFFLINE" ? "offline" 
                  : "break";

  return state !== null ? <span className={`status-circle ${stateClass}`}></span> : null;
};

const getStateName = (state: string) => {
  switch (state) {
    case "ONLINE":
      return "En línea";
    case "BREAK":
      return "Break";
    case "OFFLINE":
      return "Desconectado";
    case null:
      return "";
    default:
      return state[0].toUpperCase() + state.slice(1).toLowerCase();
  }
};

const AdminTable = () => {

  const INITIAL_PARAMS = {
    search: "",
    page: 1
  }

    const [data, setData] = useState<DataType>({
      nodes: [],
      totalPages: 0
    })

    const [createUser, setCreateUser] = useState(false);
    
    const fetchData = useCallback(async (params: UsersList) => { 
      const response = await api.get(`/admin/users?term=${params.search}&page=${params.page}`)
      setData({
        nodes: response.data.data,
        totalPages: response.data.last_page
      })
    }, [])

    useEffect(() => {
        fetchData({
          search: INITIAL_PARAMS.search,
          page: INITIAL_PARAMS.page
        })
    }, [fetchData])

    const [search, setSearch] = useState(INITIAL_PARAMS.search);

    const handleSearch = () => {
      fetchData({
        search: search,
        page: 1
      })
      pagination.fns.onSetPage(1);
    }

    useCustom("search", data, {
      state: { search }
    })

    const onChangePagination = (_action: any, state: any) => {
      fetchData({
        search,
        page: state.page
      })
    }

    const pagination = usePagination(
      data,
      {
        state: {
          page: INITIAL_PARAMS.page
        },
        onChange: onChangePagination,
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
              color: var(--gray-dark);
            }
            &:nth-of-type(even) {
              background-color: var(--table-even);
              color: var(--gray-dark);
            }
            &:hover {
              background-color: rgba(14, 93, 157, 0.05);
            }
          `,
          Cell: `
            padding: 0.875rem 1rem;
            font-size: 0.875rem;
          `,
          HeaderCell: `
            padding: 1rem;
            font-weight: 500;
            font-size: 0.875rem;
          `,
        },
    ]);

    const handleShowAddUser = () => {
      setCreateUser(!createUser);
    }

    const handleNewUser = () => {
      fetchData({
        search,
        page: 1,
      });
      pagination.fns.onSetPage(1);
    }

    const isChecked = (status: string) => {
      if (status === "active"){
        return true;
      } else{
        return false;
      }
    }

    const handleChangeChecked = async (item: UserData) => {
      try {
        await api.patch(`/admin/users/${item.id}/status`, {
          status: item.status === "inactive" ? "active" : "inactive"
        })
        setData({
          nodes: data.nodes.map(user => user.id === item.id ? {...user, status: item.status === "inactive" ? "active" : "inactive"}: user),
          totalPages: data.totalPages
        });
      } catch(error){
        toast.info
        (
          <div>
            <h4>Error al activar el usuario</h4>
            <p>El usuario no cuenta con una contraseña asignada</p>
          </div>
        );
      }
    }

    const user = JSON.parse(localStorage.getItem('user') || "{}");

    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="admin-content"
        >
          <div className="search-user-container">
            <div className="input-admin-container">
              <input className="input-filter-admin" type='text' value={search} onChange={(e) => setSearch(e.target.value)}/>
              <IoMdSearch onClick={handleSearch} className="search-icon-admin"/>
            </div>
            {(user.role_code === "ADMIN" || user.role_code === "SUPPORT") && <button className="add-user-admin" onClick={handleShowAddUser}>Crear usuario <IoIosAddCircleOutline className="icon-add-admin"/></button>}
          </div>
            <Table
              data={data}
              theme={theme}
              pagination={pagination}
              className="table"
            >
              {(tableList: UserData[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell resize>Nombre</HeaderCell>
                      <HeaderCell resize>Usuario</HeaderCell>
                      <HeaderCell resize>Correo</HeaderCell>
                      <HeaderCell resize>Rol</HeaderCell>
                      <HeaderCell>Estado</HeaderCell>
                      <HeaderCell>Activo</HeaderCell>
                    </HeaderRow>
                  </Header>
                  <Body>
                    {tableList.map((item: UserData) => (
                      <Row key={item.id} item={item}>
                        <Cell>
                          {item.full_name}
                        </Cell>
                        <Cell>
                          {item.username}
                        </Cell>
                        <Cell>
                          {item.email}
                        </Cell>
                        <Cell>
                          {item.role}
                        </Cell>
                        <Cell>
                          {getStateCircle(item.state)} {getStateName(item.state)}
                        </Cell>
                        <Cell>
                          <div className="flipswitch">
                            <input type="checkbox" checked={isChecked(item.status)} disabled={!(user.role_code === "ADMIN" || user.role_code === "SUPPORT")} name="flipswitch" className="flipswitch-cb" id={`fs-${item.id}`} onChange={() => handleChangeChecked(item)}/>
                            <label className="flipswitch-label" htmlFor={`fs-${item.id}`}>
                              <div className="flipswitch-inner"></div>
                              <div className="flipswitch-switch"></div>
                            </label>
                          </div>
                        </Cell>
                      </Row>
                    ))}
                  </Body>
                </>
              )}
            </Table>
            <div className="page-selector-container">
              {Array(data.totalPages)
                .fill(null)
                .map((_, index) => (
                  <button className={`page-selector-btns ${pagination.state.page === index + 1 ? "selected-page": ""}`} key={index} onClick={() => pagination.fns.onSetPage(index + 1)}>
                    {index + 1}
                  </button>
                ))
              }
            </div>
            <AnimatePresence mode="wait">
              {createUser && (user.role_code === "ADMIN" || user.role_code === "SUPPORT") && <CreateUser handleShowAddUser={handleShowAddUser} handleNewUser={handleNewUser}/>}
            </AnimatePresence>
            <ToastContainer 
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              rtl={false}
              draggable
              theme="light"
              transition={Bounce}
            />
        </motion.div>
    )

}

export default AdminTable
