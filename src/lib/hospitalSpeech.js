export const buildOffPlanQ1Speech = ({
  name,
  hospitalName,
  procedure = 'planned hip replacement',
  possessive = 'his',
}) =>
  `${name} books a ${procedure} at ${hospitalName} — outside ${possessive} plan hospital networks. Why might ${name} pay more out of pocket?`;

export const buildOnPlanQ2Speech = ({ name, hospitalName, possessive = 'his' }) =>
  `${name} needs the same procedure at ${hospitalName}, which is on ${possessive} plan networks. Who pays at network rates?`;

export const buildOffPlanCorrectionSpeech = ({ networks, planLabel }) =>
  `To avoid out-of-pocket costs, planned procedures should be done at hospitals within your plan's network${networks ? ` — ${networks} on ${planLabel}` : ''}. Outside those networks, you could pay much more out of pocket than at an in-network hospital.`;

export const buildOnPlanCorrectionSpeech = ({ networks }) =>
  `Hospitals on ${networks} are your lowest-risk choice for planned care — your medical scheme pays at network rates with the lowest out-of-pocket cost.`;
