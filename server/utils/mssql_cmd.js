const iovStats = (startDate, endDate) => {
  //   console.log([startDate, endDate]);
  // return `select a.Chart, CONVERT(DATE, p.Birth_Date) as Birth_Date, p.Race, p.Primary_Code, p.Address_1, p.city, p.State, a.Reason,
  //             CONVERT(DATE, a.Appt_Date) as Appt_Date, p.Ref_Source, a.MD, a.Status from dbo.Appointment_VIEW as a inner
  //             join dbo.Patien_Info_V5 as p on p.Chart_Number = a.Chart where a.Appt_Date between '${startDate}' and '${endDate}'
  //             order by a.Appt_Date`;
  return `select a.Chart, p.Birth_Date, p.Race, p.Primary_Code, p.Address_1, p.city, p.State, a.Reason, 
              a.Appt_Date, p.Ref_Source, a.MD, a.Status, p.First_Name, p.Last_Name, p.Home_Email, p.Home_Phone from dbo.Appointment_VIEW as a inner 
              join dbo.Patien_Info_V5 as p on p.Chart_Number = a.Chart where a.Appt_Date between '${startDate}' and '${endDate}' 
              order by a.Appt_Date`;
};

// adding field provider for R1 f/u
const iovStatsV2 = (startDate, endDate) => {
  //   console.log([startDate, endDate]);
  // return `select a.Chart, CONVERT(DATE, p.Birth_Date) as Birth_Date, p.Race, p.Primary_Code, p.Address_1, p.city, p.State, a.Reason,
  //             CONVERT(DATE, a.Appt_Date) as Appt_Date, p.Ref_Source, a.MD, a.Status from dbo.Appointment_VIEW as a inner
  //             join dbo.Patien_Info_V5 as p on p.Chart_Number = a.Chart where a.Appt_Date between '${startDate}' and '${endDate}'
  //             order by a.Appt_Date`;
  return `select a.Chart, p.Birth_Date, p.Race, p.Primary_Code, p.Address_1, p.city, p.State, a.Reason, 
              a.Appt_Date, p.Ref_Source, a.MD, a.Provider, a.Status, p.First_Name, p.Last_Name, p.Home_Email, p.Home_Phone from dbo.Appointment_VIEW as a inner 
              join dbo.Patien_Info_V5 as p on p.Chart_Number = a.Chart where a.Appt_Date between '${startDate}' and '${endDate}' 
              order by a.Appt_Date`;
};

const startDates = (startDate, endDate) => {
  // return `select art.Chart_Number, CONVERT(DATE, s.StartDate) as StartDate from dbo.ART_CYCLE_V3 as art
  //   inner join dbo.StimSheet_V3 as s on art.ID = s.ARTCycle_ID
  //   where s.StartDate between '${startDate}' and '${endDate}' and art.CycleCount = 1 and art.CycleTypeId like 'IVF%'`;

  return `select art.Chart_Number, s.StartDate from dbo.ART_CYCLE_V3 as art 
    inner join dbo.StimSheet_V3 as s on art.ID = s.ARTCycle_ID
    where s.StartDate between '${startDate}' and '${endDate}' and art.CycleCount = 1 and art.CycleTypeId like 'IVF%'`;
};

const dateColumns = ['DOB', 'Latest_IOV_Appt_Date', 'R1_Appt_Date', 'IVF_Start_Date'];

module.exports = {
  iovStats,
  iovStatsV2,
  startDates,
  dateColumns,
};
