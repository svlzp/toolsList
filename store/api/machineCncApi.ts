import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './customBaseQuery';

export interface MachineFile {
  id: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  path: string;
}

export interface MachineCnc {
  id: number;
  name: string;
  description?: string;
  specifications?: string;
  files?: MachineFile[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMachineDto {
  name: string;
  description?: string;
  specifications?: string;
}

export interface UpdateMachineDto {
  name?: string;
  description?: string;
  specifications?: string;
}

export interface FileData {
  uri: string;
  name: string;
  type: string;
}

export const machineCncApi = createApi({
  reducerPath: 'machineCncApi',
  baseQuery: baseQuery,
  tagTypes: ['MachineCnc'],
  endpoints: (builder) => ({
    getAllMachines: builder.query<MachineCnc[], void>({
      query: () => ({
        url: '/machine-cnc',
        method: 'GET',
      }),
      providesTags: (result) => 
        result 
          ? [...result.map((machine) => ({ type: 'MachineCnc' as const, id: machine.id })), 'MachineCnc']
          : ['MachineCnc'],
    }),

    getMachineById: builder.query<MachineCnc, number>({
      query: (id) => ({
        url: `/machine-cnc/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'MachineCnc', id }],
    }),

    createMachine: builder.mutation<
      MachineCnc,
      { data: CreateMachineDto; files?: FileData[] }
    >({
      query: ({ data, files }) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) {
          formData.append('description', data.description);
        }
        if (data.specifications) {
          formData.append('specifications', data.specifications);
        }
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append('files', {
              uri: file.uri,
              name: file.name,
              type: file.type,
            } as any);
          });
        }

        return {
          url: '/machine-cnc',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['MachineCnc'],
    }),

    updateMachine: builder.mutation<
      MachineCnc,
      { id: number; data: UpdateMachineDto; files?: FileData[] }
    >({
      query: ({ id, data, files }) => {
        const formData = new FormData();
        if (data.name) {
          formData.append('name', data.name);
        }
        if (data.description) {
          formData.append('description', data.description);
        }
        if (data.specifications) {
          formData.append('specifications', data.specifications);
        }
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append('files', {
              uri: file.uri,
              name: file.name,
              type: file.type,
            } as any);
          });
        }

        return {
          url: `/machine-cnc/${id}`,
          method: 'PATCH',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'MachineCnc', id }],
    }),

    deleteMachine: builder.mutation<void, number>({
      query: (id) => ({
        url: `/machine-cnc/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MachineCnc'],
    }),

    removeFile: builder.mutation<void, { machineId: number; fileId: number }>({
      query: ({ machineId, fileId }) => ({
        url: `/machine-cnc/${machineId}/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { machineId }) => [
        { type: 'MachineCnc', id: machineId },
      ],
    }),
  }),
});

export const {
  useGetAllMachinesQuery,
  useGetMachineByIdQuery,
  useCreateMachineMutation,
  useUpdateMachineMutation,
  useDeleteMachineMutation,
  useRemoveFileMutation,
} = machineCncApi;
