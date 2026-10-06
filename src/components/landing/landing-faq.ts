import { YLP_1, YLP_2_SELECTION } from "@/config/cohorts";
import { formatCount, formatProgramDate } from "@/utils/impact-format";

const { youthLeaders, universities, cities, reportingTeam, gender } = YLP_2_SELECTION;

/** Landing page FAQs. Also emitted as FAQPage structured data, so keep it to what the page shows. */
export const landingFaqItems = [
  {
    question: "What is YLP 2.0?",
    answer: "YLP 2.0 is Pakistan's biggest youth leadership program by Combine Foundation, a six-month journey helping university students build leadership, communication, project management, teamwork and professional skills through practical learning.",
  },
  {
    question: "Who can apply for YLP?",
    answer: "Any university student with Pakistani nationality can apply from any university, any academic discipline, and any gender.",
  },
  {
    question: "What is the duration of the program?",
    answer: "YLP 2.0 is a six-month leadership program consisting of workshops, mentoring, networking, community involvement and other leadership development opportunities.",
  },
  {
    question: "Is YLP 2.0 online or offline?",
    answer: "YLP 2.0 is a combination of physical and online activities.",
  },
  {
    question: "Will I receive a certificate after completing the program?",
    answer: "Yes. Successful candidates are awarded a certificate by Combine Foundation, along with an experience letter and a recommendation letter.",
  },
  {
    question: "What makes YLP 2.0 different from other leadership programs?",
    answer: "YLP 2.0 is built around practical learning, students work on real projects instead of purely theoretical training.",
  },
  {
    question: "Is there any previous success in the Youth Leadership Program?",
    answer: `Yes. YLP 1.0 (${formatProgramDate(YLP_1.startDate)} – ${formatProgramDate(YLP_1.endDate)}) engaged ${YLP_1.youthLeaders} Youth Leaders and ${YLP_1.volunteers} volunteers from ${YLP_1.universities} universities across ${YLP_1.cities} cities, reaching ${formatCount(YLP_1.directBeneficiaries)} direct beneficiaries.`,
  },
  {
    question: "How many Youth Leaders are in YLP 2.0?",
    answer: `YLP 2.0 selected ${youthLeaders} Youth Leaders from ${universities} universities across ${cities} cities, representing Punjab, Sindh, Islamabad, Khyber Pakhtunkhwa, Balochistan and Gilgit. Women make up ${gender.female.share} of the cohort. They are supported by ${reportingTeam.ros} Reporting Officers, ${reportingTeam.sros} Senior Reporting Officers and ${reportingTeam.headRos} Head of Reporting Officers.`,
  },
  {
    question: "How do I become part of YLP 2.0?",
    answer: "Apply through the official Combine Foundation application form. Visit the official website or social media pages for the latest updates and deadlines.",
  },
];
