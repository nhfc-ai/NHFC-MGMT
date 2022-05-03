const preTriggerInfo = (startDate, endDate) => {
  return `select u.patient_id_id, u.date, b.estrogen, b.progesterone, u.follicles, t.doctor_decision 
            from ivf_ultrasoundtest u
            inner join ivf_treatment t on t.patient_id_id = u.patient_id_id and u.date = t.date 
            inner join ivf_bloodtest b on b.patient_id_id = u.patient_id_id and u.date = b.date 
            where u.date between '${startDate}' and '${endDate}' and t.doctor_decision REGEXP 'Ovidrel|Lupron'`;
};

module.exports = {
  preTriggerInfo,
};
