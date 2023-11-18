import axios from "axios"
import {useAppStore} from "@/stores/app";

export function transformTableToArray<T>(tableData: { table: T[]; type: string }, NodeName): T[] {
    if (tableData.type === "table" && Array.isArray(tableData.table)) {
      if (NodeName == null)
        return [...tableData.table];

      return tableData.table.map((dict) => {
        return {
          ...dict,
          'Node': NodeName
        };
      });
    } else {
      throw new Error("Invalid input data format");
    }
  }

  export function selectedNodeValid(SelectedNode) {
    if (SelectedNode == null || SelectedNode.value == null || SelectedNode.value == "" ||SelectedNode.value == undefined) {
      return false;
    }

    return true;
  }

  export async function doVerneMQAPICall(node, path) {
    let combinedPath = path;
    console.log(node);

    if (node != '') {
      combinedPath = '/webuiapi/v1/nodefwd/'+node+'/'+path;
    }

    const { token } = storeToRefs(useAppStore());
    const response = await axios.get(combinedPath, {headers: {'x-token': token.value}, validateStatus: status => (status == 200 || status === 401)});
    if (response.status == 401) {
      token.value = 'not_yet_set';
    }
    return response;
  }
