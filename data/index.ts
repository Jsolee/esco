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

export const RAW = {
  territory,
  topics,
  elections: [
    { election: g27, questions: g27Questions, candidacies: [g27A, g27B, g27BE, g27C, g27D, g27F, g27G] },
  ],
};
