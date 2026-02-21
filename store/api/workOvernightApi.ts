import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './customBaseQuery';

export interface WorkOvernight {
  id: number;
  title: string;
  description?: string;
  quantity: number;
  completed: number;
  rt: string;
  isArchived: boolean;
  manufacturingTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkDto {
  name?: string;
  rt: string;
  quantity: number;
  madeBy?: string;
  completed: number;
  manufacturingTime?: string;
  machineId: number;
  stages?: string[]; // Особенности установки
}

export interface UpdateWorkDto {
  title?: string;
  description?: string;
  quantity?: number;
  rt?: string;
  isArchived?: boolean;
}

export interface UpdateQuantityDto {
  rt: string;
  completed?: number;
  quantity?: number;
}

export interface WorkStage {
  id: number;
  workId: number;
  description: string;
  files: string[]; 
  order: number;
}

export interface CreateStageDto {
  stepNumber: number;
  description?: string;
}


export const workOvernightApi = createApi({
  reducerPath: 'workOvernightApi',
  baseQuery: baseQuery,
  tagTypes: ['WorkOvernight'],
  endpoints: (builder) => ({

    getAllWorks: builder.query<
      WorkOvernight[],
      { includeArchived?: boolean; machineId?: number }
    >({
      query: ({ includeArchived = false, machineId }) => {
        const params: any = { includeArchived };
        if (machineId) params.machineId = machineId;
        return {
          url: '/work-overnight',
          method: 'GET',
          params,
        };
      },
      providesTags: ['WorkOvernight'],
    }),

  
    getArchivedWorks: builder.query<WorkOvernight[], void>({
      query: () => ({
        url: '/work-overnight/archived',
        method: 'GET',
      }),
      providesTags: ['WorkOvernight'],
    }),

    getWorkByMachine: builder.query<
      WorkOvernight[],
      { machineId: number; includeArchived?: boolean }
    >({
      query: ({ machineId, includeArchived = false }) => ({
        url: `/work-overnight/machine/${machineId}`,
        method: 'GET',
        params: { includeArchived },
      }),
      providesTags: (result, error, { machineId }) => [{ type: 'WorkOvernight', id: machineId }],
    }),


    getWorkById: builder.query<WorkOvernight, number>({
      query: (id) => ({
        url: `/work-overnight/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'WorkOvernight', id }],
    }),


    getWorkByRt: builder.query<WorkOvernight[], string>({
      query: (rt) => ({
        url: `/work-overnight/rt/${rt}`,
        method: 'GET',
      }),
      providesTags: (result, error, rt) => [{ type: 'WorkOvernight', id: rt }],
    }),


    createWork: builder.mutation<WorkOvernight, CreateWorkDto>({
      query: (data) => {
        console.log('📝 createWork - body:', data);
        return {
          url: '/work-overnight',
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['WorkOvernight'],
    }),


    updateWork: builder.mutation<
      WorkOvernight,
      { id: number; data: UpdateWorkDto }
    >({
      query: ({ id, data }) => ({
        url: `/work-overnight/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'WorkOvernight', id }],
    }),


    updateQuantityByRt: builder.mutation<
      WorkOvernight,
      UpdateQuantityDto
    >({
      query: (data) => {
        console.log('📝 updateQuantityByRt - body:', data);
        return {
          url: '/work-overnight/quantity/update',
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['WorkOvernight'],
    }),


    deleteWork: builder.mutation<void, number>({
      query: (id) => ({
        url: `/work-overnight/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkOvernight'],
    }),

 
    getStagesByWorkId: builder.query<WorkStage[], number>({
      query: (workId: number) => ({
        url: `/work-overnight/${workId}/stages`,
        method: 'GET',
      }),
      providesTags: (result, error, workId) => [{ type: 'WorkOvernight', id: workId }],
    }),


    getStagesByRt: builder.query<WorkStage[], string>({
      query: (rt: string) => ({
        url: `/work-overnight/stages/rt/${rt}`,
        method: 'GET',
      }),
      providesTags: (result, error, rt) => [{ type: 'WorkOvernight', id: rt }],
    }),

  
    createStage: builder.mutation<
      WorkStage,
      { workId: number; formData: FormData }
    >({
      query: ({ workId, formData }) => ({
        url: `/work-overnight/${workId}/stages`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { workId }) => [{ type: 'WorkOvernight', id: workId }],
    }),

  
    updateStageFile: builder.mutation<
      WorkStage,
      { stageId: number; formData: FormData }
    >({
      query: ({ stageId, formData }) => {
      
        return {
          url: `/work-overnight/stages/${stageId}/file`,
          method: 'PATCH',
          body: formData,
        };
      },
      invalidatesTags: ['WorkOvernight'],
    }),

    deleteStageFile: builder.mutation<
      void,
      { stageId: number; fileName: string }
    >({
      query: ({ stageId, fileName }) => {
        
        return {
          url: `/work-overnight/stages/${stageId}/file/${fileName}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['WorkOvernight'],
    }),

    removeStage: builder.mutation<void, number>({
      query: (stageId) => {
  
        return {
          url: `/work-overnight/stages/${stageId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['WorkOvernight'],
    }),
  }),
});

export const {
  useGetAllWorksQuery,
  useGetArchivedWorksQuery,
  useGetWorkByIdQuery,
  useGetWorkByRtQuery,
  useGetWorkByMachineQuery,
  useCreateWorkMutation,
  useUpdateWorkMutation,
  useUpdateQuantityByRtMutation,
  useDeleteWorkMutation,
  useGetStagesByWorkIdQuery,
  useGetStagesByRtQuery,
  useCreateStageMutation,
  useUpdateStageFileMutation,
  useDeleteStageFileMutation,
  useRemoveStageMutation,
} = workOvernightApi;
