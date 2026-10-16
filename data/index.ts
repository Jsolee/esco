// Registre de dades. Per afegir una elecció, importa'n els fitxers i afegeix-la a ELECTIONS (vegeu DATA_GUIDE.md).
import territory from "./territory.json";
import topics from "./topics.json";

import g27 from "./elections/generals-2027-ficticia/election.json";
import g27Questions from "./elections/generals-2027-ficticia/questions.json";
import g27A from "./elections/generals-2027-ficticia/candidacies/partit-a.json";
import g27B from "./elections/generals-2027-ficticia/candidacies/partit-b.json";
import g27BE from "./elections/generals-2027-ficticia/candidacies/coalicio-b-e.json";
import g27C from "./elections/generals-2027-ficticia/candidacies/partit-c.json";
import g27D from "./elections/generals-2027-ficticia/candidacies/partit-d.json";
import g27F from "./elections/generals-2027-ficticia/candidacies/partit-f.json";
import g27G from "./elections/generals-2027-ficticia/candidacies/partit-g.json";

import g26 from "./elections/generals-2026/election.json";
import g26Questions from "./elections/generals-2026/questions.json";
import g26Pp from "./elections/generals-2026/candidacies/pp.json";
import g26Psoe from "./elections/generals-2026/candidacies/psoe.json";
import g26Psc from "./elections/generals-2026/candidacies/psc.json";
import g26Vox from "./elections/generals-2026/candidacies/vox.json";
import g26FrenteAmplio from "./elections/generals-2026/candidacies/frente-amplio.json";
import g26Podemos from "./elections/generals-2026/candidacies/podemos.json";
import g26Erc from "./elections/generals-2026/candidacies/erc.json";
import g26Junts from "./elections/generals-2026/candidacies/junts.json";
import g26EhBildu from "./elections/generals-2026/candidacies/eh-bildu.json";
import g26EajPnv from "./elections/generals-2026/candidacies/eaj-pnv.json";
import g26Bng from "./elections/generals-2026/candidacies/bng.json";
import g26Compromis from "./elections/generals-2026/candidacies/compromis.json";
import g26Cc from "./elections/generals-2026/candidacies/cc.json";

export const RAW = {
  territory,
  topics,
  elections: [
    { election: g27, questions: g27Questions, candidacies: [g27A, g27B, g27BE, g27C, g27D, g27F, g27G] },
    {
      election: g26,
      questions: g26Questions,
      candidacies: [g26Pp, g26Psoe, g26Psc, g26Vox, g26FrenteAmplio, g26Podemos, g26Erc, g26Junts, g26EhBildu, g26EajPnv, g26Bng, g26Compromis, g26Cc],
    },
  ],
};
