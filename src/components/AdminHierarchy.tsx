import { useTree, CellTree } from '@table-library/react-table-library/tree';
import { Table, Header, HeaderRow, Body, HeaderCell, Cell, Row, TableNode } from "@table-library/react-table-library/table";
import { useState, useCallback, useEffect } from 'react';
import api from '../hooks/useAxiosInstance';
import { motion } from 'framer-motion';
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { Nullish } from '@table-library/react-table-library/types/common';
import '../styles/AdminHierarchy.css';


interface UserData extends TableNode {
    children_count: number;
    email: string;
    full_name: string;
    id: number;
    nodes: Nullish | ChildData[];
    role: string;
    role_id: number;
    status: string;
    username: string;
}

interface ChildData {
    id: number;
    child: UserData;
    child_id: number;
    created_at: string;
    is_active: boolean;
    parent_id: number;
    updated_at: string;
}


const AdminHierarchy = () => {

  const [data, setData] = useState<{ nodes: UserData[] }>({
    nodes: []
  })

  const fetchData = useCallback(async () => {
    const processed_nodes: UserData[] = [];
    const response = await api.post("/users", {
      role_id: 3
    })
    response.data.forEach((user: UserData) => {
      if (user.children_count > 0) {
        user.nodes = [];
      }
      processed_nodes.push(user);
    });
    setData({nodes: processed_nodes})
  }, [])

  useEffect(() => {
    fetchData();
  }, [fetchData])

  const onTreeChange = async (action: any, _state: any) => {
    const childs: ChildData[] = []
    if (action.type === "ADD_BY_ID"){
      const response = await api.get(`/admin/users/${action.payload.id}/children`)
      for(const e of response.data){
        const child = e.child;
        child.id = e.child_id;
        child.child_id = e.child_id;
        if (child.children_count > 0) {
          child.nodes = [];
        }
        childs.push(child);
      }
      const parentId = response.data[0].parent_id;
      const search = (nodes: any) => {
        const level: UserData[] = [];
        nodes.forEach((node: any) => {
          if (node.id === parentId && childs.length !== node.nodes?.length) {
            level.push({...node, nodes: [...childs]});
          } else if (node.nodes) {
            const node_children = search(node.nodes);
            level.push({...node, nodes: node_children});
          } else {
            level.push(node);
          }
        });
        return level;
      }
      setData(
        prev => ({
          nodes: search(prev.nodes)
        })
      )
    }
  }

  const tree = useTree(data, {
    onChange: onTreeChange,
  });

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        width: 100%;
      `,
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

  return (
    <motion.div
      className="hierarchy-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
        <Table data={data} tree={tree} theme={theme}>
        {(tableList: any) => (
            <>
            <Header>
                <HeaderRow>
                <HeaderCell>Nombre de Usuario</HeaderCell>
                <HeaderCell>Nombre completo</HeaderCell>
                <HeaderCell>Correo</HeaderCell>
                <HeaderCell>Rol</HeaderCell>
                </HeaderRow>
            </Header>
            <Body>
                {tableList.map((item: any) => (
                <Row key={item.id} item={item}>
                    <CellTree item={item}>
                    {item.username ? item.username : item.children.username}
                    </CellTree>
                    <Cell>
                    {item.full_name}
                    </Cell>
                    <Cell>
                    {item.email}
                    </Cell>
                    <Cell>
                    {item.role}
                    </Cell>
                </Row>
                ))}
            </Body>
            </>
        )}
        </Table>
    </motion.div>
  )
}

export default AdminHierarchy;
