"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import tkrAxiosInstance from "@/lib/axios/axiosInstance";

const initialState = {
  countryData: null,
  usrData: null,
  selectedDate: null,
  selectedProfessional: null,
  selectedInmedProfessional: null,
  selectedHomeCare: null,
  selectedPlan: null,
  selectedService: null,
  guestData: null,
};

export const fetchDoctorHours2 = createAsyncThunk(
  "tkr/fetchDoctorHours2",
  async (query) =>
    await tkrAxiosInstance("/general/professional-hours", "post", {
      id: query.id,
      day: query.dia,
    }),
);

export const userData = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setCountryData: (state, action) => {
      state.countryData = action.payload;
    },
    setUserEmail: (state, action) => {
      state.usrData = { email: action.payload };
    },
    setUserData: (state, action) => {
      state.usrData = action.payload;
    },
    updateUserData: (state, action) => {
      state.usrData = { ...state.usrData, ...action.payload };
    },
    setDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    updateDate: (state, action) => {
      if (action.payload.PROXIMA_FECHA) {
        state.selectedService.professional.day = action.payload.PROXIMA_FECHA;
        state.selectedService.professional.hour = null;
      } else {
        state.selectedService.professional.hour = action.payload;
      }
    },
    clearDate: (state) => {
      state.selectedDate = null;
    },
    setProfessional: (state, action) => {
      state.selectedProfessional = action.payload;
    },
    clearProfessional: (state) => {
      state.selectedProfessional = null;
    },
    setInmedProfessional: (state, action) => {
      state.selectedInmedProfessional = action.payload;
    },
    clearInmedProfessional: (state) => {
      state.selectedInmedProfessional = null;
    },
    setHomeCare: (state, action) => {
      state.selectedHomeCare = action.payload;
    },
    clearHomeCare: (state) => {
      state.selectedHomeCare = null;
    },
    setPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    clearPlan: (state) => {
      state.selectedPlan = null;
    },
    setService: (state, action) => {
      state.selectedService = action.payload;
    },
    updateHomeServices: (state, action) => {
      const { serv, del } = action.payload;
      const { ID, VALOR_SERVICIO, ACTIVO, ...servRest } = serv;

      const { servs, selServs, price } = state.selectedService.homeCare;

      if (!del) {
        state.selectedService = {
          ...state.selectedService,
          homeCare: {
            servs: servs + "," + serv.ID.toString(),
            selServs: [...selServs, serv],
            price: price + serv.VALOR_SERVICIO,
          },
        };
      } else {
        const newSelServs = selServs.filter((s) => s.ID !== serv.ID);
        const newPrice = price - serv.VALOR_SERVICIO;

        state.selectedService = {
          ...state.selectedService,
          homeCare: {
            servs: servs
              .split(",")
              .filter((num) => num !== serv.ID.toString())
              .join(","),
            selServs: newSelServs,
            price: newPrice,
          },
        };
      }
    },
    clearService: (state) => {
      state.selectedService = null;
    },
    setGuestData: (state, action) => {
      state.guestData = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      // fetchDoctorHours2
      .addCase(fetchDoctorHours2.pending, (state, action) => {
        // state.status = { fetching: true };
      })
      .addCase(fetchDoctorHours2.fulfilled, (state, action) => {
        // state.status.response = action.payload.msg;
        // const queryId = action.meta.arg.id;
        const queryDia = action.meta.arg.dia;
        // console.log(queryDia);
        // console.log(action.payload);

        const updatedDates = state.selectedService.professional.dates.map(
          (date) =>
            date.PROXIMA_FECHA === queryDia
              ? { ...date, hours: action.payload }
              : date,
        );

        state.selectedService.professional.dates = updatedDates;
        // professional.dates = appendHoursToDay;

        // const newObj = state.tekerProfessionals.map((obj) =>
        //   obj.ID === queryId ? { ...obj, dates: professional.dates } : obj
        // );

        // state.tekerProfessionals = newObj;
        // state.status.fetching = false;
      })
      .addCase(fetchDoctorHours2.rejected, (state, action) => {
        // state.status.response = action.error.message;
        // state.status.fetching = false;
      });
  },
});

export const {
  setCountryData,
  setUserEmail,
  setUserData,
  updateUserData,
  setDate,
  updateDate,
  clearDate,
  setProfessional,
  clearProfessional,
  setInmedProfessional,
  clearInmedProfessional,
  setHomeCare,
  clearHomeCare,
  setPlan,
  clearPlan,
  setService,
  updateHomeServices,
  clearService,
  setGuestData,
} = userData.actions;

export default userData.reducer;
