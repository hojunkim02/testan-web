const EMBEDDED_SAMPLE = "id,q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12,q13,q14,q15,q16,q17,q18,q19,q20,q21,q22,q23,q24,q25,q26,q27,q28,q29,q30,q31,q32,q33,q34,q35,q36,q37,q38,q39,q40,q41,q42,q43,q44,q45,q46,q47,q48,q49,q50,q51,q52,q53,q54,q55,q56,q57,q58,q59,q60,q61,q62,q63,q64,q65,q66,q67,q68,q69,q70\nKEY,4,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,4,2,3,3,3,2,2,3,1,1,3,2,2,3,2,1,1,1,1,2,1,1,1,2,1,1,3,1,3,3,4,3,3,2,2,1,3,4,3,2,4,1,3\nOPTIONS,4,4,2,4,4,4,2,5,4,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4\nINCLUDE,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y,y\n0001,2,3,1,3,3,4,2,2,2,3,1,2,3,1,4,4,4,2,4,3,3,4,4,1,1,1,3,2,1,3,3,3,2,2,2,1,3,3,4,2,3,2,1,1,1,3,1,1,1,1,1,1,1,,2,3,1,4,3,3,2,2,3,3,4,3,2,4,2,3\n0002,2,3,2,3,3,4,2,2,2,3,2,2,3,1,2,3,4,2,2,3,3,2,4,1,1,2,1,4,1,1,3,2,2,2,3,1,1,3,3,3,3,2,2,4,1,1,2,1,2,2,2,1,2,4,4,3,1,4,3,3,2,2,2,3,2,4,1,4,3,2\n0003,4,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,3,3,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,2,3,3,2,3,2,1,4,3,3,4,4,1,1,1,1,2,4,2,3,1,4,3,3,2,2,4,3,4,3,1,1,2,4\n0004,4,3,2,3,3,4,2,2,1,3,1,2,3,1,4,4,4,1,1,3,3,4,4,1,1,1,1,4,1,3,2,4,2,2,3,1,4,2,3,2,3,1,1,4,1,4,2,3,2,1,1,1,2,4,2,3,1,4,3,3,2,2,3,3,4,3,1,1,3,3\n0005,1,3,2,3,3,4,1,2,1,3,1,2,3,1,1,3,3,2,4,1,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,3,2,2,3,2,1,1,2,1,2,1,2,2,1,1,2,3,2,3,1,4,3,3,2,2,4,1,2,3,1,1,3,3\n0006,1,3,2,3,2,4,1,2,2,3,1,2,3,1,4,3,4,2,1,4,3,4,4,1,1,1,3,2,1,1,4,3,2,2,3,1,1,4,2,2,3,3,1,1,4,2,,1,2,1,1,1,2,4,2,3,1,4,3,2,2,2,2,3,4,3,1,1,3,3\n0007,2,3,1,3,4,4,2,3,1,3,1,2,3,1,4,3,4,2,1,4,3,4,4,1,1,1,3,3,1,1,4,2,2,2,3,1,4,2,2,2,3,4,2,1,4,1,3,3,2,1,1,1,2,3,2,3,1,4,3,3,2,2,3,3,4,3,3,4,3,3\n0008,4,3,2,3,4,4,1,2,1,3,1,2,3,1,1,3,4,1,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,4,2,2,3,2,3,1,1,4,1,3,2,1,1,1,1,1,1,4,2,3,1,4,3,3,2,2,3,3,4,3,1,1,2,3\n0009,2,3,1,3,3,4,2,2,1,3,1,2,3,1,2,4,4,1,2,1,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,2,2,3,2,1,1,2,3,2,1,1,2,1,1,2,3,2,3,1,4,3,3,2,2,2,3,4,3,1,4,1,3\n0010,2,3,2,3,3,4,1,2,1,3,1,2,3,1,1,2,4,1,2,4,3,4,4,1,1,1,1,4,1,3,2,3,3,2,3,1,1,2,4,3,3,4,1,4,2,4,2,1,2,1,1,2,2,3,3,3,1,2,3,2,2,1,2,3,,3,1,1,4,3\n0011,1,3,1,3,3,4,2,2,1,3,1,3,3,1,2,4,4,2,4,3,3,4,4,1,1,1,1,4,1,3,4,3,2,2,3,1,1,2,3,2,3,2,3,4,4,1,2,3,1,1,1,1,1,3,3,3,1,4,3,3,2,2,2,3,4,3,3,4,2,3\n0012,4,3,1,3,3,4,2,3,1,,1,2,3,1,2,3,4,1,2,3,3,4,4,1,1,1,1,3,1,4,4,3,2,2,3,1,2,4,4,2,4,2,1,4,3,3,4,4,1,2,1,1,2,4,2,3,1,3,3,3,4,1,4,3,2,3,1,4,4,2\n0013,2,3,2,3,3,3,2,2,2,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,1,3,1,4,4,3,2,2,3,1,3,2,2,2,1,2,2,1,1,3,2,1,1,1,1,1,2,4,3,2,1,4,3,3,2,2,3,2,2,3,3,4,4,3\n0014,2,3,2,3,3,4,2,1,1,3,2,3,3,1,2,3,4,2,1,4,3,3,4,1,1,1,1,4,1,2,4,2,4,2,3,1,2,4,4,2,3,1,2,1,2,3,2,3,1,1,1,1,2,3,3,3,1,4,3,3,2,2,2,3,4,3,1,4,2,3\n0015,4,3,1,3,4,4,1,2,2,3,1,2,3,1,1,4,4,1,1,3,3,4,4,1,1,1,3,4,1,3,3,2,2,2,3,1,2,2,3,2,3,3,2,1,1,3,4,4,1,1,2,1,2,4,2,3,1,4,3,3,2,2,2,3,4,3,1,3,1,1\n0016,2,3,1,3,3,4,1,3,1,3,1,2,3,1,4,3,4,3,2,3,3,4,4,1,1,1,1,3,1,2,2,3,2,2,3,1,1,3,2,2,3,2,1,1,1,3,4,3,1,1,2,1,2,4,2,3,1,4,3,1,2,2,2,3,4,3,1,4,4,4\n0017,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,1,2,3,2,3,3,2,1,1,3,2,,1,1,2,1,2,,2,3,1,4,3,2,2,2,2,3,4,3,1,4,2,3\n0018,2,3,1,3,3,4,2,2,1,3,1,2,3,1,1,3,4,4,2,3,3,4,4,1,1,1,1,3,1,3,3,3,2,2,3,1,3,4,4,2,3,4,2,1,2,2,3,1,1,1,2,1,2,4,3,3,1,4,2,3,2,2,2,3,4,3,3,4,2,4\n0019,4,3,2,3,2,4,2,2,2,3,1,2,3,1,4,3,3,4,1,3,3,4,4,1,1,1,3,2,1,1,2,3,2,2,3,1,1,4,4,2,3,2,1,4,1,3,2,3,1,1,1,1,2,3,2,3,1,1,3,3,2,2,2,3,2,3,1,1,2,4\n0020,4,3,2,3,2,4,2,2,2,3,1,2,3,1,4,3,3,4,1,3,3,4,4,1,1,1,3,2,1,1,2,3,2,2,3,1,1,4,1,2,3,2,1,4,3,3,2,3,1,1,1,1,2,3,2,3,1,1,3,3,2,2,2,3,2,3,1,1,2,4\n0021,1,3,2,3,2,4,2,2,2,3,1,2,1,1,2,3,2,2,4,3,3,4,4,1,1,1,3,3,1,2,4,3,2,2,3,1,1,3,3,3,3,2,1,1,2,3,1,3,2,1,2,1,2,3,2,3,3,4,2,3,2,2,2,3,2,3,1,4,2,4\n0022,2,3,2,3,3,4,2,3,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,2,2,3,2,3,2,1,1,4,3,2,3,1,1,1,1,2,3,3,2,1,2,3,3,2,2,2,2,2,3,1,2,3,3\n0023,1,3,2,3,3,4,2,2,1,2,1,2,3,1,4,3,4,1,2,1,3,4,4,1,1,2,3,4,1,3,4,2,2,2,3,1,1,3,1,3,3,3,1,4,1,3,1,1,1,1,1,1,2,3,3,3,1,4,3,1,2,2,2,3,2,3,1,4,3,3\n0024,1,3,2,3,3,4,2,1,1,2,1,2,3,1,2,3,4,1,2,1,3,4,4,1,1,2,3,4,1,3,4,2,2,2,3,1,1,3,1,2,3,3,1,4,1,3,2,1,1,1,1,1,2,3,3,3,1,4,3,1,2,2,2,3,2,3,1,4,3,3\n0025,2,3,2,3,3,4,2,2,2,3,1,2,3,1,4,3,4,2,4,3,3,2,4,1,1,1,3,1,3,3,4,3,2,2,3,1,1,3,2,2,3,4,1,1,2,3,1,1,1,1,1,1,2,,2,3,1,4,2,3,2,2,2,3,4,3,1,2,1,3\n0026,2,3,2,3,1,4,2,3,2,3,1,2,3,1,4,3,4,2,4,3,3,4,4,1,1,1,3,1,1,3,4,3,2,2,3,1,2,2,2,2,3,2,1,1,2,3,1,1,1,1,1,1,2,,4,3,1,4,2,3,2,2,4,3,4,3,3,4,1,3\n0027,4,3,2,3,4,4,2,2,1,3,1,3,3,1,4,4,4,2,1,4,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,4,4,2,3,2,2,1,1,3,2,1,1,1,2,1,2,4,2,3,3,4,3,3,2,2,4,3,4,3,1,4,3,3\n0028,3,3,1,3,3,4,2,2,2,3,1,2,3,1,1,3,4,4,2,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,1,1,2,2,2,3,2,2,4,1,3,2,4,1,1,1,1,2,3,2,3,1,4,3,2,2,2,4,3,4,3,3,4,3,3\n0029,1,4,2,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,2,1,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,1,2,3,3,3,2,3,1,2,4,2,1,1,1,2,1,2,3,3,3,1,3,3,3,2,2,4,3,2,3,2,4,2,3\n0030,2,3,1,3,3,4,2,1,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,1,4,1,3,4,3,2,2,3,1,1,2,3,2,3,3,1,1,4,3,2,1,1,1,2,1,2,3,4,1,1,4,3,3,2,2,2,1,4,3,3,1,1,3\n0031,2,3,2,3,4,4,2,2,1,3,1,2,3,4,1,3,4,2,3,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,3,2,3,2,3,3,1,1,2,3,2,3,1,1,2,,,,,,,,,,,,,,,,,,,\n0032,4,3,2,3,1,1,2,2,1,3,2,2,3,1,4,4,4,2,1,3,4,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,3,3,3,2,3,2,1,3,2,4,2,3,2,2,1,1,2,3,2,3,3,4,3,3,2,2,3,3,4,3,1,4,2,3\n0033,4,4,2,3,4,4,2,2,1,3,1,2,3,1,4,3,4,2,4,3,3,4,4,1,1,1,1,3,3,3,4,3,2,2,3,1,3,2,3,4,3,1,1,1,1,3,2,1,2,1,1,1,2,4,2,3,1,4,3,3,2,2,4,3,4,3,1,4,2,3\n0034,4,3,1,3,3,4,2,2,1,3,1,2,3,3,3,2,4,1,1,3,3,3,4,1,1,1,1,1,1,3,4,3,2,2,3,1,3,3,3,3,3,3,2,1,1,2,2,4,2,2,1,1,1,4,3,2,1,1,2,3,2,2,4,2,4,3,1,3,3,3\n0035,1,3,1,3,1,4,1,2,1,3,1,2,3,1,2,3,4,4,3,3,3,4,4,1,1,1,3,4,1,3,4,2,2,2,3,1,1,4,4,2,3,2,1,1,1,3,2,1,2,1,2,1,2,4,2,3,1,4,3,3,2,2,3,3,2,,,,,\n0036,2,3,1,3,3,4,2,2,1,3,1,3,3,1,1,3,1,2,3,1,3,4,4,1,1,1,1,3,1,3,3,3,2,2,3,1,1,2,4,2,1,3,3,1,4,3,3,1,1,2,1,1,2,3,4,3,1,4,3,3,2,2,2,4,2,3,1,4,3,3\n0037,4,3,2,3,3,4,2,2,1,3,1,2,3,1,2,3,4,1,4,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,1,2,2,3,3,3,2,1,1,2,3,2,1,1,1,2,1,2,3,2,3,1,4,3,2,2,2,2,3,1,3,3,4,3,4\n0038,2,3,1,3,3,4,2,2,2,3,1,2,3,1,4,3,4,2,4,3,3,1,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,2,2,2,3,3,1,1,3,4,3,1,1,1,1,1,2,4,3,4,3,2,4,3,2,2,4,3,4,3,3,1,1,4\n0039,4,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,4,4,3,4,1,3,2,3,2,2,3,1,1,3,3,2,3,2,1,4,1,1,2,4,1,1,1,1,1,,2,3,2,4,3,3,2,2,2,3,4,3,1,4,1,3\n0040,4,3,1,3,4,4,2,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,4,1,3,4,3,3,2,3,1,2,3,3,3,3,2,1,1,2,1,2,3,1,1,2,3,1,,3,3,1,4,3,3,3,2,2,3,4,3,3,4,3,3\n0041,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,1,3,4,4,1,1,1,1,3,1,2,4,3,2,2,3,1,1,3,2,2,3,2,2,1,4,3,2,3,1,1,1,1,2,4,3,3,1,4,3,3,2,2,2,3,4,3,1,1,3,3\n0042,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,1,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,1,3,2,2,3,3,3,1,4,3,2,3,2,2,2,1,2,,2,3,1,2,2,3,2,2,2,3,4,3,1,4,3,4\n0043,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,1,2,2,2,3,2,2,1,3,3,2,3,2,1,1,2,2,,2,3,1,4,3,3,2,3,2,3,2,3,1,4,2,3\n0044,2,3,2,3,3,1,2,3,1,3,1,3,3,1,1,3,4,1,1,3,3,4,4,1,1,4,3,2,1,1,3,4,2,2,3,4,1,2,2,3,3,4,1,1,1,3,3,3,2,1,1,1,2,3,3,3,1,4,3,4,2,4,4,3,4,3,2,1,4,3\n0045,4,3,2,3,4,4,2,2,1,3,1,3,3,1,4,2,1,2,2,4,3,4,4,1,1,1,1,3,1,3,3,3,2,2,3,4,1,3,3,3,3,3,1,1,2,3,2,1,1,1,1,1,2,4,2,3,1,4,3,3,2,2,2,3,2,3,1,4,4,3\n0046,2,3,1,3,4,4,2,3,2,3,2,2,3,1,4,4,4,2,3,3,3,4,4,1,1,1,3,1,1,3,4,3,2,2,3,1,1,3,4,2,3,2,1,1,3,1,2,1,2,1,2,2,1,4,,3,1,4,2,3,2,2,2,3,4,3,3,1,3,3\n0047,1,3,1,3,4,4,2,2,1,3,1,2,3,1,4,1,4,1,1,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,1,2,3,2,3,1,1,1,3,1,3,3,2,1,2,1,2,4,2,3,3,4,3,3,2,2,1,3,2,3,1,4,3,4\n0048,2,3,1,3,1,4,2,2,1,3,1,2,3,1,4,4,4,2,1,3,3,4,4,1,1,1,3,3,1,3,2,3,2,2,3,1,3,4,4,3,3,2,1,1,1,3,2,,1,1,1,1,1,3,2,3,1,4,3,3,2,2,2,3,4,3,3,4,2,4\n0049,1,1,1,3,1,4,2,2,1,3,1,2,3,1,1,3,4,4,4,3,3,4,4,1,1,1,1,3,3,1,3,3,2,2,3,1,1,2,4,2,3,1,2,3,1,3,4,1,1,1,1,1,2,4,4,3,1,4,3,4,2,2,2,3,2,3,1,1,3,3\n0050,2,1,1,3,1,1,2,2,2,3,1,2,3,3,4,4,4,1,1,2,3,4,4,1,1,1,1,4,1,1,4,3,2,2,3,1,3,2,2,2,3,4,1,1,1,1,2,1,2,2,1,1,2,3,3,2,1,4,2,3,2,2,4,2,2,3,1,4,2,3\n0051,2,3,2,3,1,4,2,3,1,3,2,2,3,1,4,4,4,2,3,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,1,3,3,2,3,2,1,1,1,1,3,1,2,2,1,1,2,4,2,4,1,2,3,3,2,2,4,4,4,3,1,1,4,3\n0052,2,3,1,3,3,1,2,3,2,3,2,2,3,1,4,4,4,1,1,1,2,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,4,2,3,2,1,1,2,3,4,3,1,1,2,1,1,,3,3,1,4,3,3,2,2,2,3,4,3,1,1,3,1\n0053,2,3,2,3,1,4,1,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,4,2,3,2,2,3,1,2,4,3,2,3,2,1,4,1,3,4,1,1,2,1,1,2,4,2,3,1,4,3,3,2,2,4,3,2,3,3,1,4,3\n0054,1,3,1,3,3,4,1,3,2,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,1,3,3,3,2,3,1,1,4,1,3,2,1,1,1,2,1,1,3,3,3,2,4,3,3,2,2,4,3,2,3,1,4,3,3\n0055,4,3,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,2,2,4,2,3,2,2,1,1,3,2,1,1,1,1,1,2,4,3,3,1,4,3,3,2,2,2,3,4,3,3,4,1,3\n0056,1,3,2,1,4,4,2,1,2,3,1,2,3,1,1,4,4,2,4,2,3,4,4,1,1,1,1,4,1,3,2,3,2,2,3,1,2,3,2,2,3,1,2,2,1,3,3,4,1,1,1,1,2,3,3,3,1,4,3,3,2,2,2,3,4,3,3,1,2,3\n0057,1,3,1,3,3,4,1,2,1,3,1,2,3,1,4,2,4,2,1,3,3,4,4,1,1,1,3,4,1,2,2,3,2,2,3,1,2,2,2,2,3,2,1,1,2,1,2,1,1,1,1,1,1,3,3,3,1,4,3,3,2,2,2,3,4,3,1,4,3,3\n0058,4,3,2,3,4,4,1,2,1,3,1,2,3,1,1,3,4,2,1,4,3,4,4,1,1,1,3,4,1,2,3,3,2,2,3,1,2,3,4,3,3,2,1,1,1,1,2,3,1,1,2,1,2,,3,3,1,4,3,3,2,2,2,3,4,3,1,4,2,3\n0059,2,3,2,4,1,4,1,3,2,3,2,2,3,1,1,3,4,2,2,1,3,2,4,1,1,1,3,4,1,2,3,2,2,2,3,4,3,2,3,4,3,4,1,2,1,3,2,4,1,2,1,1,2,2,3,3,1,4,3,3,2,2,2,3,4,3,4,1,2,2\n0060,1,3,2,3,3,3,2,2,2,3,1,3,3,1,4,3,4,2,3,1,3,4,4,1,1,1,3,3,1,3,4,2,2,2,3,1,1,2,3,2,3,3,1,1,1,3,4,2,2,2,1,1,1,4,3,1,1,4,4,3,2,2,4,1,4,3,3,1,1,4\n0061,2,3,1,3,3,4,2,2,1,3,1,2,3,1,1,3,4,1,2,3,3,4,4,1,1,1,3,1,1,3,4,3,2,1,3,1,2,2,3,2,4,2,1,1,1,3,2,1,2,2,1,1,2,4,2,3,1,4,3,3,2,2,3,3,2,3,3,1,3,3\n0062,2,3,1,3,1,4,1,2,1,3,1,2,3,1,4,3,4,2,2,3,3,4,4,1,1,1,3,4,1,3,3,2,2,2,3,1,3,2,3,3,3,2,1,3,4,4,2,3,1,1,1,1,2,3,2,3,4,4,3,1,2,2,2,3,4,3,1,1,1,3\n0063,2,3,2,3,4,4,2,2,1,3,1,3,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,4,2,3,3,3,2,2,3,1,2,2,3,3,3,2,1,1,1,3,2,2,2,1,2,1,1,4,3,3,1,1,3,3,2,2,4,3,2,3,1,4,2,3\n0064,2,1,2,3,1,4,2,2,1,3,1,3,3,1,4,1,4,3,3,3,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,4,3,3,2,1,1,1,1,4,1,1,1,2,1,2,4,2,3,1,4,3,3,2,2,2,3,4,3,1,4,1,3\n0065,4,3,2,3,1,4,1,2,1,3,1,2,3,1,2,2,4,1,3,3,3,4,4,1,1,1,3,3,1,2,3,4,2,2,3,1,1,2,3,4,3,3,1,1,2,1,2,1,2,1,,1,2,,2,3,1,4,3,1,2,2,4,3,4,3,1,1,3,3\n0066,3,4,1,3,1,4,2,2,1,3,1,3,3,1,4,4,3,2,1,3,3,4,4,1,1,1,3,4,1,3,2,3,2,2,3,4,2,2,2,2,3,2,1,1,2,3,2,1,1,2,1,2,2,4,4,3,1,1,2,4,2,4,3,3,4,3,1,4,2,3\n0067,4,1,2,3,3,4,2,2,1,3,1,2,3,1,2,3,4,2,2,3,3,4,4,1,1,1,3,3,1,2,,3,2,2,3,1,1,2,2,3,3,1,1,1,1,3,2,1,1,1,1,1,1,4,2,3,1,4,3,3,2,2,2,3,2,3,1,4,3,3\n0068,2,3,2,3,1,1,1,2,2,3,1,2,3,1,1,3,4,1,1,3,3,3,4,1,1,1,1,2,1,3,3,3,,2,3,1,1,3,2,4,3,2,1,1,1,3,2,1,1,1,1,1,2,,2,3,1,4,,3,2,2,2,3,4,3,1,1,2,1\n0069,2,3,2,3,1,4,2,2,1,3,1,2,3,1,4,3,4,2,2,3,3,4,4,1,1,1,1,3,2,3,2,3,2,2,3,4,1,3,3,3,3,3,1,1,3,3,2,1,1,2,1,1,2,4,2,1,1,4,4,3,2,2,2,1,2,3,1,4,2,1\n0070,4,3,2,3,1,4,2,2,1,3,1,2,3,1,2,3,4,2,3,3,3,3,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,2,3,3,1,3,3,4,2,1,4,2,2,2,2,1,2,3,2,2,1,4,3,4,1,2,4,2,4,3,1,1,2,4\n0071,2,3,2,3,4,4,1,2,2,3,1,2,3,3,1,3,3,1,4,3,3,4,4,1,4,1,3,3,1,1,4,3,2,2,3,1,1,2,3,3,3,2,1,1,1,1,4,1,2,1,1,1,2,4,2,3,1,4,3,1,2,2,2,3,2,3,1,4,1,3\n0072,2,3,2,3,1,1,1,1,1,3,1,2,3,1,2,3,4,1,2,3,3,4,4,1,1,2,1,4,1,3,3,3,2,2,3,1,4,2,3,3,2,2,3,1,1,3,3,2,1,1,2,1,1,1,2,3,3,4,3,3,2,1,1,3,2,3,1,1,3,3\n0073,2,3,2,4,1,4,2,2,2,3,1,2,3,1,2,3,4,1,3,3,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,2,2,2,3,3,4,1,1,3,3,4,3,1,2,1,1,1,,3,3,1,4,3,3,2,2,2,3,2,3,1,4,3,3\n0074,2,3,1,3,1,4,2,3,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,1,4,2,3,2,3,2,1,3,4,1,4,2,2,3,4,1,1,2,3,2,3,2,1,2,1,2,4,4,1,2,2,3,3,2,2,2,3,2,3,1,1,1,3\n0075,1,1,2,3,1,4,1,1,2,3,1,2,3,1,4,4,4,2,2,1,3,4,4,4,1,1,1,4,2,3,3,3,2,2,3,1,3,3,3,3,3,1,1,1,1,1,3,1,2,2,1,1,2,3,2,2,2,2,2,1,2,2,4,2,4,3,3,1,2,4\n0076,2,3,1,3,1,4,1,2,1,3,1,2,3,1,4,3,4,1,1,4,3,3,4,1,1,1,3,4,1,3,2,3,2,2,3,4,1,4,4,3,3,2,3,1,1,3,3,1,1,2,2,2,1,,3,4,1,4,3,3,2,2,2,4,4,3,3,4,3,3\n0077,2,3,1,3,3,4,1,2,1,3,1,2,3,3,4,3,4,2,4,1,3,4,4,1,1,1,1,4,1,4,2,3,2,2,3,4,1,2,2,2,3,3,1,1,4,2,2,1,2,1,1,1,1,3,2,3,1,4,3,3,2,2,2,3,2,3,3,3,2,3\n0078,2,3,2,3,3,4,1,2,1,3,1,2,3,1,4,3,4,1,1,3,3,4,4,1,1,2,1,4,3,3,4,3,2,2,3,1,2,4,3,3,3,2,1,1,2,3,2,3,1,2,2,1,2,,3,4,1,2,3,1,2,2,2,4,2,3,1,1,2,4\n0079,2,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,1,4,1,3,3,3,2,2,3,1,3,3,3,2,1,2,1,1,1,3,4,1,1,2,2,1,2,4,2,3,1,4,3,3,2,2,2,3,4,3,1,4,3,3\n0080,4,4,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,4,1,1,3,1,2,3,3,3,2,2,3,4,3,3,3,2,3,3,1,1,2,3,2,1,1,2,2,1,2,3,2,3,1,4,2,3,2,2,2,3,4,3,3,4,3,3\n0081,4,1,2,3,4,4,2,2,2,3,2,2,3,1,2,4,4,1,3,1,3,3,4,1,1,1,3,1,2,2,3,3,2,2,3,1,3,2,1,3,1,3,1,1,3,4,4,3,1,2,2,1,2,1,4,4,2,2,2,4,4,3,2,1,2,3,2,4,2,3\n0082,4,1,1,3,4,4,2,2,2,3,2,2,3,1,1,4,4,1,3,1,3,1,4,1,1,1,3,1,2,2,3,3,2,2,3,1,3,2,1,3,1,3,3,1,3,4,4,3,1,2,1,1,2,1,4,4,2,2,2,4,4,3,4,1,4,3,2,4,2,3\n0083,4,3,2,3,3,4,1,2,1,3,1,2,3,1,1,4,4,3,1,3,3,4,4,1,1,1,1,3,1,3,4,3,2,2,3,1,2,3,2,3,3,1,1,1,4,4,2,1,2,1,2,1,2,3,2,3,1,4,3,1,2,2,2,3,4,3,1,4,4,3\n0084,1,3,2,3,3,4,2,2,1,3,1,2,3,1,2,4,4,4,3,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,4,2,2,2,2,3,4,2,1,1,3,3,4,1,1,2,1,1,4,3,3,1,4,3,3,2,2,2,3,4,3,3,1,2,4\n0085,1,3,1,3,4,4,2,2,2,3,1,2,3,1,4,3,4,2,2,1,3,4,4,1,1,1,3,3,1,3,2,2,2,2,3,1,1,1,1,1,3,1,1,1,3,4,2,3,2,2,1,1,2,4,3,3,1,4,3,2,2,2,4,3,2,3,3,4,2,3\n0086,2,3,2,3,4,4,2,2,1,3,2,2,3,1,2,3,4,2,3,4,3,4,4,1,1,1,3,3,1,4,4,4,2,2,3,1,1,2,2,3,3,4,1,4,1,3,2,,1,2,1,1,2,4,4,3,1,4,3,3,2,2,2,3,2,3,1,4,3,4\n0087,2,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,2,2,3,3,4,1,1,3,3,1,3,1,1,2,1,2,,3,3,1,4,3,3,2,2,2,3,4,3,1,4,2,3\n0088,4,3,2,3,3,4,2,2,2,3,2,2,3,1,4,3,1,3,3,3,3,3,4,2,1,1,2,1,2,1,4,2,2,2,3,1,1,2,3,2,3,1,1,4,2,3,4,1,1,1,1,1,2,3,4,3,1,4,3,1,2,2,2,3,4,3,1,1,2,3\n0089,2,3,2,3,4,4,2,2,2,3,1,2,3,1,4,4,3,2,2,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,4,1,2,3,2,3,1,1,4,1,3,2,3,2,2,2,1,2,3,3,3,2,4,3,3,2,2,2,3,4,3,1,1,1,4\n0090,4,3,1,3,4,4,2,2,1,3,1,2,3,1,2,4,4,2,1,3,3,4,4,1,1,1,1,4,3,3,4,3,2,2,3,1,2,2,3,3,3,1,1,1,1,3,4,3,1,2,2,1,2,3,2,2,1,4,4,3,2,2,2,3,4,3,1,1,3,4\n0091,4,3,2,3,3,4,2,2,2,3,2,2,3,1,4,4,1,3,3,3,3,3,4,2,1,1,2,1,2,1,4,2,2,2,3,1,1,2,2,2,3,1,1,1,1,3,2,3,1,1,1,1,2,3,2,2,2,3,3,3,2,2,2,3,4,3,1,1,2,3\n0092,2,3,1,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,4,3,3,4,1,1,1,3,3,1,3,4,3,2,2,3,1,1,4,3,2,3,1,1,1,1,1,4,1,2,1,2,1,2,3,4,3,4,4,3,3,2,2,3,3,4,3,1,4,3,3\n0093,4,3,1,3,3,4,2,2,2,3,1,2,3,1,4,4,4,2,2,1,3,2,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,2,3,4,2,2,2,1,1,1,3,2,1,2,,2,1,,3,2,3,1,4,3,2,2,2,2,4,3,1,4,3,3\n0094,2,3,1,3,3,4,2,1,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,3,2,2,2,3,1,2,3,3,2,3,2,1,3,1,3,4,3,1,1,1,1,2,3,2,3,1,1,3,3,2,2,2,3,4,3,1,4,3,1\n0095,2,3,2,3,3,4,2,2,1,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,2,1,2,4,3,2,2,3,4,3,2,3,1,1,3,1,1,2,4,2,2,1,2,1,1,2,4,4,2,2,4,3,3,2,2,1,2,2,3,1,1,3,4\n0096,4,3,2,3,1,4,1,2,1,3,1,2,3,1,4,4,4,2,3,4,3,4,4,1,1,1,3,3,1,2,3,3,2,2,3,4,2,2,2,2,3,1,1,4,2,1,2,3,1,2,2,1,2,3,2,3,1,4,3,3,2,2,2,3,4,3,3,4,1,4\n0097,2,3,2,3,3,4,2,1,1,3,1,2,3,1,1,3,4,1,2,4,3,4,4,1,1,1,3,4,2,3,3,3,2,2,3,4,1,2,2,2,3,4,3,1,3,4,2,3,1,1,2,1,2,4,3,3,1,4,3,3,2,2,2,3,,4,3,4,3,3\n0098,2,3,1,3,3,4,1,2,2,3,1,2,3,1,4,2,4,2,1,3,3,4,4,1,1,1,3,2,1,2,4,3,2,2,3,4,3,2,3,1,1,3,1,1,2,4,2,2,1,2,1,1,2,4,4,2,2,4,3,3,2,2,1,2,2,3,1,1,3,4\n0099,2,3,2,3,3,4,1,2,2,3,1,2,3,1,4,2,4,2,1,3,3,4,4,1,1,1,3,2,1,2,4,3,2,2,3,4,3,2,3,1,1,3,1,1,2,4,2,2,1,2,1,1,2,4,4,2,2,4,3,3,2,2,1,2,2,3,1,1,3,4\n0100,2,3,1,3,4,4,2,2,1,2,1,2,3,1,4,3,4,3,2,3,3,4,4,1,1,1,3,2,2,1,4,3,2,2,3,1,2,2,2,3,3,3,3,1,1,3,4,1,1,1,1,1,1,3,3,3,1,4,4,3,2,2,2,3,4,3,3,4,3,2\n0101,2,3,1,3,4,4,2,2,1,3,1,2,3,1,4,3,4,3,1,3,3,3,4,1,1,3,3,2,2,1,4,3,2,2,3,1,2,3,2,2,3,2,2,1,1,3,4,1,1,1,1,3,1,1,2,3,1,4,3,3,2,2,2,3,4,3,3,4,3,2\n0102,2,3,2,3,3,4,1,2,1,3,1,2,3,1,4,3,4,1,4,3,3,4,4,1,1,1,3,4,1,1,4,3,2,2,3,1,1,3,3,3,3,2,1,1,1,3,2,3,1,1,2,1,2,3,3,3,1,4,3,2,2,2,2,3,4,3,3,4,3,3\n0103,3,3,2,3,1,4,1,2,2,3,1,2,3,1,4,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,1,2,2,3,3,3,3,1,4,4,3,2,1,2,2,2,1,2,3,2,3,1,4,3,3,2,2,2,3,4,3,1,1,3,3\n0104,1,3,1,3,1,4,2,1,1,3,1,2,3,1,2,4,4,2,4,3,3,4,4,1,1,1,3,4,1,4,4,2,3,2,3,1,1,2,3,2,1,3,1,4,2,3,2,1,2,2,1,1,2,4,2,3,1,4,2,3,2,1,3,3,4,4,1,4,3,3\n0105,1,1,1,3,1,1,2,3,2,3,2,2,3,1,4,4,3,2,2,4,3,3,4,1,1,2,1,4,3,2,2,3,2,2,3,1,1,4,1,2,3,4,4,4,1,2,3,1,1,2,1,1,2,3,4,4,4,4,2,3,2,1,3,3,4,4,1,4,3,3\n0106,2,3,2,3,3,4,1,2,2,3,1,2,3,1,1,3,4,2,2,1,3,4,4,1,1,1,3,3,1,3,4,3,2,2,3,4,3,3,2,2,3,4,3,3,1,1,4,3,1,2,1,1,2,4,2,2,2,4,2,3,2,2,4,2,4,4,1,1,3,3\n0107,4,3,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,2,1,3,3,4,4,1,1,1,3,3,1,3,3,3,2,2,3,1,1,3,3,2,3,4,1,1,1,1,2,3,1,1,2,1,2,4,2,3,1,4,3,3,2,2,3,3,4,3,1,4,3,3\n0108,2,3,1,3,,4,2,2,1,3,1,2,3,1,2,4,4,2,2,4,3,4,4,1,1,1,3,1,1,2,3,4,2,2,3,1,3,2,2,4,1,4,3,1,2,3,2,1,1,1,1,1,2,4,2,3,3,4,3,2,2,4,2,3,4,4,1,4,2,3\n0109,2,3,1,3,1,4,2,2,1,3,1,2,3,1,4,3,4,2,4,3,3,4,4,1,1,1,3,3,1,3,4,4,2,2,3,1,1,3,1,3,3,1,1,1,1,4,2,1,1,1,2,1,2,4,2,3,1,4,3,3,2,2,4,3,2,3,3,4,3,4\n0110,1,1,2,3,3,4,2,2,1,3,1,2,3,3,1,3,4,1,1,2,3,4,4,1,1,1,3,3,1,3,4,3,3,2,3,1,4,3,3,1,1,1,3,4,2,3,2,3,1,1,1,3,2,3,4,1,3,2,2,4,2,2,2,1,1,2,4,1,2,3\n0111,1,3,1,3,4,4,2,2,2,3,1,2,3,1,4,3,4,1,1,3,3,4,4,1,1,1,3,4,1,3,3,3,2,2,3,1,1,2,1,2,3,1,1,1,4,3,2,1,1,2,1,1,2,3,4,3,1,4,3,3,2,2,2,3,4,3,3,4,3,3\n0112,2,3,2,3,3,4,2,2,1,3,1,2,3,1,1,3,4,4,2,4,3,4,4,1,1,3,1,2,1,2,4,3,2,2,3,1,3,4,2,3,3,4,1,1,1,3,2,3,1,1,2,1,2,3,2,1,1,4,3,4,2,2,3,3,4,3,1,1,1,3\n0113,2,3,2,3,1,4,1,2,1,3,1,2,3,1,4,3,4,1,3,3,3,4,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,1,2,3,4,1,1,1,1,2,1,1,1,1,1,2,4,2,3,1,4,3,3,2,2,2,3,2,3,1,4,3,4\n0114,2,3,1,3,3,4,1,2,1,3,1,2,3,1,4,3,4,1,4,1,3,3,4,1,1,1,3,4,1,3,4,3,2,2,3,1,1,3,3,2,3,1,3,1,4,3,2,1,1,1,1,1,2,3,2,3,1,4,2,3,2,2,4,3,4,3,1,1,2,3\n0115,2,3,2,3,3,4,2,2,1,3,,2,3,1,2,3,4,2,4,3,3,4,4,1,1,1,3,3,1,3,4,4,2,2,3,1,4,3,2,2,1,2,1,1,1,3,2,1,1,2,1,1,1,4,3,3,1,4,3,4,2,2,2,3,4,3,1,4,2,4\n0116,1,1,1,3,1,4,2,2,2,4,1,2,3,1,4,4,4,2,3,3,3,4,4,1,1,1,3,3,2,1,4,3,2,2,3,1,1,2,2,3,3,2,1,1,3,3,3,1,2,1,2,1,2,4,2,3,1,4,3,3,2,2,4,3,2,3,1,1,1,3\n0117,1,3,2,3,4,4,2,2,1,3,1,2,3,1,1,4,4,1,4,3,3,4,4,4,,1,3,3,1,3,4,3,2,2,3,1,1,2,1,3,3,2,1,4,2,3,2,1,1,2,2,3,2,,2,3,1,4,3,3,2,2,2,3,2,3,1,4,2,4\n0118,2,3,2,4,4,3,1,2,1,3,1,2,3,1,4,3,4,1,1,3,3,4,4,1,1,3,3,4,1,3,2,2,2,2,3,1,3,2,3,3,3,4,1,3,3,3,2,1,1,1,2,1,2,3,2,3,1,4,3,3,2,4,2,1,3,3,2,4,1,1\n0119,1,3,1,3,3,4,2,1,1,2,1,3,3,1,2,3,4,1,2,3,3,4,4,1,1,1,3,4,1,2,4,3,2,2,3,1,2,2,3,2,3,1,1,1,1,3,2,1,2,1,2,1,2,4,3,3,1,4,2,3,1,1,4,3,2,3,1,1,2,3\n";
"use strict";

/* ---------- 상태 ---------- */
const S = {
  raw: null, // readSource 결과
  fileName: "",
  sheetName: "",
  isDemo: false,
  src: null, // buildSource 결과 { ids, resp, nItems, prefill, info }
  key: [],
  opt: [],
  inc: [],
  result: null,
};

const $ = (id) => document.getElementById(id);
const esc = (t) =>
  String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  },
};

const setStatus = (msg, cls = "") => {
  const el = $("status");
  el.textContent = msg;
  el.className = "status " + cls;
};

/* ---------- 테마 ---------- */
const SUN_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 4.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM7.25 0h1.5v2h-1.5zM7.25 14h1.5v2h-1.5zM0 7.25h2v1.5H0zM14 7.25h2v1.5h-2zM2.22 1.16l1.06-1.06 1.42 1.42-1.07 1.06zM11.3 12.24l1.06-1.06 1.42 1.42-1.07 1.06zM12.48 2.58L11.42 1.16l1.42-1.42 1.06 1.06zM1.16 13.66L.1 12.24l1.42-1.42 1.06 1.06z"/></svg>';
const MOON_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8.9 1.5a6.5 6.5 0 1 0 5.6 5.6.75.75 0 0 0-1.06-.86 5 5 0 0 1-6.2-6.2.75.75 0 0 0-.86-1.06 6.54 6.54 0 0 0-2.48 2.52z"/></svg>';
const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  store.set("theme", theme);
  $("themeBtn").innerHTML = theme === "dark" ? SUN_ICON : MOON_ICON;
  $("themeBtn").title = theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#1f1f1f" : "#0f6cbd");
  if (S.result) renderChart();
};
applyTheme(store.get("theme") ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
$("themeBtn").addEventListener("click", () =>
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"),
);

/* ---------- 탭 ---------- */
const showTab = (name) => {
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".tab-content").forEach((s) => (s.hidden = s.id !== "tab-" + name));
  if (name === "score" && S.result) renderChart();
};
document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

/* ---------- 파일 열기 ---------- */
$("openFile").addEventListener("click", () => $("fileInput").click());
$("fileInput").addEventListener("change", (e) => {
  const f = e.target.files[0];
  e.target.value = "";
  if (f) openFile(f);
});
const dz = $("dropZone");
["dragenter", "dragover"].forEach((t) =>
  dz.addEventListener(t, (e) => {
    e.preventDefault();
    dz.classList.add("dragging");
  }),
);
["dragleave", "drop"].forEach((t) => dz.addEventListener(t, () => dz.classList.remove("dragging")));
dz.addEventListener("drop", (e) => {
  e.preventDefault();
  const f = e.dataTransfer?.files?.[0];
  if (f) openFile(f);
});

const openFile = async (file) => {
  try {
    setStatus(`${file.name} 읽는 중…`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const raw = readSource(bytes, file.name, window.XLSX);
    loadRaw(raw, file.name, false);
  } catch (err) {
    setStatus(`파일을 읽지 못했습니다: ${err.message}`, "error");
  }
};

$("loadDemo").addEventListener("click", async () => {
  try {
    const text =
      typeof EMBEDDED_SAMPLE !== "undefined"
        ? EMBEDDED_SAMPLE
        : await (await fetch("sample-data/answer.csv")).text();
    loadRaw(readSource(new TextEncoder().encode(text), "answer.csv"), "예시자료(answer.dat)", true);
  } catch (err) {
    setStatus(`예시 자료를 불러오지 못했습니다: ${err.message}`, "error");
  }
});

/** 원천 자료를 응답자료로 만들고 설정 화면을 연다 */
const loadRaw = (raw, name, demo, opt = {}) => {
  S.raw = raw;
  S.fileName = name;
  S.sheetName = raw.sheetName || "";
  S.isDemo = demo;
  S.src = buildSource(raw, opt);
  initSetup();
  clearResult();
  $("demoBanner").hidden = !demo;
  $("tabs").hidden = false;
  renderSetup();
  const ok = validate().errors.length === 0;
  if (ok && hasFullPrefill()) {
    runAnalysis();
    setStatus(
      `${name}: 피험자 ${S.src.ids.length}명, 문항 ${S.src.nItems}개. 파일에 정답이 들어 있어 바로 분석했습니다.`,
      "ok",
    );
  } else {
    showTab("setup");
    setStatus(
      `${name}: 피험자 ${S.src.ids.length}명, 문항 ${S.src.nItems}개를 읽었습니다. 정답과 답지 수를 확인하고 [분석 실행]을 누르세요.`,
      "ok",
    );
  }
};

const hasFullPrefill = () => !!S.src.prefill.key && S.src.prefill.key.some((k) => k !== " ");

/* ---------- 자료 설정 ---------- */
const guessOptions = () => {
  let m = 0;
  S.src.resp.forEach((a) =>
    a.forEach((r) => {
      const v = Number(r);
      if (Number.isInteger(v) && v > m && v <= 9) m = v;
    }),
  );
  return Math.min(9, Math.max(2, m || 4));
};

const initSetup = () => {
  const n = S.src.nItems;
  const p = S.src.prefill;
  const g = guessOptions();
  S.key = Array.from({ length: n }, (_, j) => (p.key?.[j] && /^[1-9]$/.test(p.key[j]) ? p.key[j] : ""));
  S.opt = Array.from({ length: n }, (_, j) => (p.numOptions?.[j] >= 2 ? p.numOptions[j] : g));
  S.inc = Array.from({ length: n }, (_, j) => (p.scored ? p.scored[j] !== false : true));
  $("bulkOpt").value = String(g);
};

/** 설정 검사: 막는 오류(errors)와 알림(notes) */
const validate = () => {
  const n = S.src.nItems;
  const noKey = [], badKey = [], badOpt = [], outOfRange = [];
  for (let j = 0; j < n; j++) {
    if (!S.inc[j]) continue;
    const Q = S.opt[j];
    if (!(Q >= 2 && Q <= 9)) badOpt.push(j + 1);
    if (!S.key[j]) noKey.push(j + 1);
    else if (Number(S.key[j]) > Q) badKey.push(j + 1);
    if (S.src.resp.some((a) => /^\d+$/.test(a[j]) && (Number(a[j]) > Q || Number(a[j]) < 1))) outOfRange.push(j + 1);
  }
  const list = (a) => a.slice(0, 12).join(", ") + (a.length > 12 ? ` 외 ${a.length - 12}개` : "");
  const errors = [];
  const notes = [];
  if (noKey.length) errors.push(`정답이 비어 있는 문항: ${list(noKey)}`);
  if (badKey.length) errors.push(`정답이 답지 수보다 큰 문항: ${list(badKey)}`);
  if (badOpt.length) errors.push(`답지 수가 2~9가 아닌 문항: ${list(badOpt)}`);
  if (!S.inc.some(Boolean)) errors.push("분석에 포함된 문항이 없습니다.");
  if (outOfRange.length) notes.push(`답지 수를 벗어난 응답이 있는 문항: ${list(outOfRange)} (‘기타’로 집계됩니다)`);
  return { errors, notes };
};

const renderSetup = () => {
  const src = S.src;
  const info = src.info;
  const where = S.sheetName ? ` · 시트 ‘${esc(S.sheetName)}’` : "";
  $("srcSummary").innerHTML =
    `<b>${esc(S.fileName)}</b>${where} · 피험자 <b>${src.ids.length}</b>명 · 문항 <b>${src.nItems}</b>개` +
    (info.testan ? " · TestAn 응답자료 형식" : "");

  // ID 열 수 / ID 자릿수
  const row = $("idRow");
  if (S.raw.kind === "table") {
    row.innerHTML =
      `<label>학번·이름 등 앞쪽 열 수 <input type="number" id="idCols" min="1" max="${Math.max(1, info.ncols - 1)}" value="${info.idCols}" /></label>` +
      `<span class="summary">현재 ID: ${esc(src.ids[0])}${src.ids.length > 1 ? ", " + esc(src.ids[1]) : ""} …${info.stringMode ? " · 응답이 한 칸에 이어 적힌 형식" : ""}</span>`;
    $("idCols").addEventListener("change", (e) => reload({ idCols: Number(e.target.value) || 1 }));
  } else if (S.raw.kind === "fixed") {
    row.innerHTML =
      `<label>1번 문항 앞까지의 칸 수(ID 자릿수) <input type="number" id="idWidth" min="0" max="40" value="${info.idWidth}" /></label>` +
      `<span class="summary">ID와 응답이 붙어 있는 형식입니다. 첫 학생 → ID ‘${esc(src.ids[0])}’ · 1~10번 응답 ‘${esc(src.resp[0].slice(0, 10).join(""))}’. 맞게 나뉘었는지 아래 미리보기로 확인하세요.</span>`;
    $("idWidth").addEventListener("change", (e) => reload({ idWidth: Number(e.target.value) || 0 }));
  } else row.innerHTML = "";
  if (S.raw.kind === "fixed") document.querySelector("details.preview").open = true;

  // 정답/답지 수/분석 포함 표 (문항이 가로로 놓인 TestAn 방식)
  const n = src.nItems;
  const idx = Array.from({ length: n }, (_, j) => j);
  $("setupTable").innerHTML =
    `<tr><th class="rowhead">문항</th>${idx.map((j) => `<th>${j + 1}</th>`).join("")}</tr>` +
    `<tr><th class="rowhead">정답</th>${idx
      .map((j) => `<td><input class="cell key" data-j="${j}" id="key${j}" inputmode="numeric" maxlength="1" value="${S.key[j]}" aria-label="${j + 1}번 정답" /></td>`)
      .join("")}</tr>` +
    `<tr><th class="rowhead">답지 수</th>${idx
      .map((j) => `<td><input class="cell opt" data-j="${j}" id="opt${j}" inputmode="numeric" maxlength="1" value="${S.opt[j]}" aria-label="${j + 1}번 답지 수" /></td>`)
      .join("")}</tr>` +
    `<tr><th class="rowhead">분석 포함</th>${idx
      .map((j) => `<td><input type="checkbox" class="inc" data-j="${j}" id="inc${j}" ${S.inc[j] ? "checked" : ""} aria-label="${j + 1}번 분석 포함" /></td>`)
      .join("")}</tr>`;
  refreshSetupState();

  // 미리보기 (처음 15명)
  const show = Math.min(15, src.ids.length);
  $("previewTable").innerHTML =
    `<tr><th>${esc(idLabel())}</th>${idx.map((j) => `<th>${j + 1}</th>`).join("")}</tr>` +
    src.ids
      .slice(0, show)
      .map((id, i) => `<tr><td class="left">${esc(id)}</td>${src.resp[i].map((r) => `<td>${r === " " ? "" : esc(r)}</td>`).join("")}</tr>`)
      .join("") +
    (src.ids.length > show ? `<tr><td colspan="${n + 1}" class="left muted">… 외 ${src.ids.length - show}명</td></tr>` : "");
};

/** 셀 표시 상태(오류·제외)와 안내 문구 갱신 */
const refreshSetupState = () => {
  for (let j = 0; j < S.src.nItems; j++) {
    const k = $("key" + j);
    const o = $("opt" + j);
    const bad = S.inc[j] && (!S.key[j] || Number(S.key[j]) > S.opt[j]);
    k.classList.toggle("invalid", bad);
    o.classList.toggle("invalid", S.inc[j] && !(S.opt[j] >= 2 && S.opt[j] <= 9));
    k.closest("td").classList.toggle("excluded", !S.inc[j]);
    o.closest("td").classList.toggle("excluded", !S.inc[j]);
  }
  const { errors, notes } = validate();
  const filled = S.key.filter((k, j) => k && S.inc[j]).length;
  const k = S.inc.filter(Boolean).length;
  $("setupMsg").innerHTML =
    `<p>정답 입력 ${filled}/${k}문항 (분석 포함 ${k}개, 제외 ${S.src.nItems - k}개)</p>` +
    errors.map((e) => `<p class="err">${esc(e)}</p>`).join("") +
    notes.map((e) => `<p class="note">${esc(e)}</p>`).join("");
  $("runBtn").disabled = errors.length > 0;
};

const reload = (opt) => {
  try {
    const keep = { key: S.key, opt: S.opt, inc: S.inc };
    S.src = buildSource(S.raw, opt);
    initSetup();
    // 문항 수가 같으면 이미 입력한 정답·답지 수·포함 여부를 유지
    if (keep.key.length === S.src.nItems) Object.assign(S, keep);
    clearResult();
    renderSetup();
  } catch (err) {
    setStatus(err.message, "error");
  }
};

/** 설정이 바뀌면 이전 분석 결과는 무효 */
const setupChanged = () => {
  if (S.result) {
    clearResult();
    setStatus("설정을 바꿨습니다. [분석 실행]을 다시 누르면 결과가 갱신됩니다.");
  }
  refreshSetupState();
};

const setupTable = $("setupTable");
setupTable.addEventListener("input", (e) => {
  const t = e.target;
  const j = Number(t.dataset.j);
  if (t.classList.contains("key") || t.classList.contains("opt")) {
    const v = (t.value.match(/[1-9]/g) || []).pop() || "";
    t.value = v;
    if (t.classList.contains("key")) S.key[j] = v;
    else S.opt[j] = v ? Number(v) : 0;
    if (v) $((t.classList.contains("key") ? "key" : "opt") + (j + 1))?.focus();
    setupChanged();
  }
});
setupTable.addEventListener("change", (e) => {
  const t = e.target;
  if (t.classList.contains("inc")) {
    S.inc[Number(t.dataset.j)] = t.checked;
    setupChanged();
  }
});
setupTable.addEventListener("focusin", (e) => e.target.select?.());
setupTable.addEventListener("keydown", (e) => {
  const t = e.target;
  if (!t.dataset.j) return;
  const j = Number(t.dataset.j);
  const kind = t.classList.contains("key") ? "key" : t.classList.contains("opt") ? "opt" : "inc";
  const go = (id) => {
    const el = $(id);
    if (el) {
      e.preventDefault();
      el.focus();
    }
  };
  if (e.key === "ArrowRight") go(kind + (j + 1));
  else if (e.key === "ArrowLeft") go(kind + (j - 1));
  else if (e.key === "ArrowDown") go((kind === "key" ? "opt" : "inc") + j);
  else if (e.key === "ArrowUp") go((kind === "inc" ? "opt" : "key") + j);
  else if (e.key === "Backspace" && t.value === "" && kind !== "inc") go(kind + (j - 1));
});
// 정답 칸에 여러 글자를 붙여넣으면 그 칸부터 차례로 채운다
setupTable.addEventListener("paste", (e) => {
  const t = e.target;
  if (!t.classList.contains("key") && !t.classList.contains("opt")) return;
  const vals = splitKeyText(e.clipboardData.getData("text"));
  if (vals.length <= 1) return;
  e.preventDefault();
  const j0 = Number(t.dataset.j);
  const arr = t.classList.contains("key") ? S.key : S.opt;
  vals.forEach((v, i) => {
    if (j0 + i < S.src.nItems) arr[j0 + i] = t.classList.contains("key") ? v : Number(v) || 0;
  });
  renderSetup();
  setupChanged();
});

/** "4313…", "4 3 1 3", 엑셀 행(탭 구분), "①②③" 모두 받는다 */
const splitKeyText = (text) => {
  const t = String(text).trim();
  const tokens = /[\s,;]/.test(t) ? t.split(/[\s,;]+/) : t.split("");
  return tokens.map((c) => normCell(c)).map((c) => (/^[1-9]$/.test(c) ? c : ""));
};

$("applyKey").addEventListener("click", () => {
  const vals = splitKeyText($("bulkKey").value);
  if (!vals.length || !vals.some(Boolean)) {
    setStatus("정답을 입력하세요. 예: 4313341213…", "error");
    return;
  }
  const n = S.src.nItems;
  for (let j = 0; j < n; j++) S.key[j] = vals[j] ?? S.key[j];
  renderSetup();
  setupChanged();
  setStatus(
    vals.length === n
      ? `정답 ${n}개를 적용했습니다.`
      : `입력한 정답은 ${vals.length}개이고 문항은 ${n}개입니다. 앞에서부터 ${Math.min(vals.length, n)}개를 적용했습니다.`,
    vals.length === n ? "ok" : "error",
  );
});
$("bulkKey").addEventListener("keydown", (e) => e.key === "Enter" && $("applyKey").click());
$("applyOpt").addEventListener("click", () => {
  const vals = splitKeyText($("bulkOpt").value).map(Number);
  if (!vals.length || vals.some((q) => !(q >= 2 && q <= 9))) {
    setStatus("답지 수는 2~9 사이 숫자로 입력하세요. 예: 4 또는 4444455552…", "error");
    return;
  }
  const n = S.src.nItems;
  if (vals.length === 1) S.opt = S.opt.map(() => vals[0]);
  else for (let j = 0; j < Math.min(n, vals.length); j++) S.opt[j] = vals[j];
  renderSetup();
  setupChanged();
  setStatus(
    vals.length === 1
      ? `모든 문항의 답지 수를 ${vals[0]}개로 적용했습니다.`
      : vals.length === n
        ? `문항별 답지 수 ${n}개를 적용했습니다.`
        : `입력한 답지 수는 ${vals.length}개이고 문항은 ${n}개입니다. 앞에서부터 ${Math.min(vals.length, n)}개를 적용했습니다.`,
    vals.length === 1 || vals.length === n ? "ok" : "error",
  );
});
$("bulkOpt").addEventListener("keydown", (e) => e.key === "Enter" && $("applyOpt").click());
$("incAll").addEventListener("click", () => {
  S.inc = S.inc.map(() => true);
  renderSetup();
  setupChanged();
});
$("incNone").addEventListener("click", () => {
  S.inc = S.inc.map(() => false);
  renderSetup();
  setupChanged();
});

/* ---------- 분석 ---------- */
const clearResult = () => {
  S.result = null;
  document.querySelectorAll('#tabs button[data-tab="score"], #tabs button[data-tab="item"]').forEach((b) => (b.disabled = true));
  $("reportAll").disabled = true;
};

const runAnalysis = () => {
  const { errors } = validate();
  if (errors.length) {
    setStatus(errors[0], "error");
    return;
  }
  const n = S.src.nItems;
  const model = {
    nItems: n,
    key: S.key.map((k) => k || " "),
    numOptions: S.opt.map((q) => Number(q) || 0),
    scored: [...S.inc],
    weights: new Array(n).fill(1),
    students: S.src.ids.map((id, i) => ({ id, resp: S.src.resp[i] })),
  };
  S.result = analyze(model);
  document.querySelectorAll("#tabs button").forEach((b) => (b.disabled = false));
  $("reportAll").disabled = false;
  renderScores();
  renderItems();
  showTab("score");
  const st = S.result.stats;
  setStatus(`분석 완료: 피험자 ${st.n}명, 분석 포함 ${st.nScored}문항, Cronbach α ${f3(st.reliability)}`, "ok");
};
$("runBtn").addEventListener("click", runAnalysis);

/* ---------- 점수 분석 ---------- */
const renderScores = () => {
  const r = S.result;
  const st = r.stats;
  const stat = (label, value, sub = "") =>
    `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span>${sub ? `<span class="stat-sub">${sub}</span>` : ""}</div>`;
  $("statGrid").innerHTML =
    stat("피험자 수", `${st.n}명`, `만점 ${st.maxScore}점`) +
    stat("평균", st.mean.toFixed(3), `표준편차 ${st.sd.toFixed(3)}`) +
    stat("분산", st.variance.toFixed(3), `중앙값 ${st.median}`) +
    stat("최저 / 최고", `${st.min} / ${st.high}`, `범위 ${st.high - st.min}`) +
    stat("왜도 / 첨도", `${st.skewness.toFixed(3)} / ${st.kurtosis.toFixed(3)}`) +
    stat("신뢰도 α", f3(st.reliability), `측정오차 ${st.sem.toFixed(3)}`) +
    stat("상위 27%", `${r.upper.n}명`, `최저점수 ${r.upper.min}`) +
    stat("하위 27%", `${r.lower.n}명`, `최고점수 ${r.lower.max}`);

  $("distTable").innerHTML =
    "<tr><th>점수</th><th>피험자 수</th><th>백분율(%)</th><th>누가 피험자 수</th><th>누가 백분율(%)</th></tr>" +
    r.distribution
      .map((d) => `<tr><td>${d.score}</td><td>${d.n}</td><td>${d.pct.toFixed(2)}</td><td>${d.cumN}</td><td>${d.cumPct.toFixed(2)}</td></tr>`)
      .join("");
  renderScoreTable();
  renderChart();
};

const idLabel = () => {
  const l = S.src?.info?.idLabel || "ID";
  return /^id$/i.test(l) ? "ID" : l;
};
const renderScoreTable = () => {
  const r = S.result;
  const list = $("scoreSort").value === "rank" ? [...r.students].sort((a, b) => a.rank - b.rank) : r.students;
  $("scoreTable").innerHTML =
    `<tr><th>${esc(idLabel())}</th><th>점수</th><th>석차</th></tr>` +
    list.map((s) => `<tr><td class="left">${esc(s.id)}</td><td>${s.raw}</td><td>${s.rank}</td></tr>`).join("");
};
$("scoreSort").addEventListener("change", renderScoreTable);

let chartHits = [];
const renderChart = () => {
  if (!S.result || $("tab-score").hidden) return;
  const cv = $("chart");
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  const w = Math.max(300, cv.parentElement.clientWidth - 2);
  chartHits = drawScoreChart(
    cv,
    S.result.distribution,
    { bar: v("--accent"), axis: v("--text-secondary"), text: v("--text"), grid: v("--stroke") },
    { width: w, height: w < 560 ? 260 : 320, dpr: window.devicePixelRatio || 1, font: "system-ui, 'Malgun Gothic', sans-serif" },
  );
  cv.style.width = w + "px";
  cv.style.height = (w < 560 ? 260 : 320) + "px";
};
window.addEventListener("resize", () => S.result && renderChart());
const tip = document.createElement("div");
tip.className = "chart-tip";
tip.hidden = true;
document.body.appendChild(tip);
$("chart").addEventListener("mousemove", (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const h = chartHits.find((hh) => x >= hh.x0 && x < hh.x1);
  if (!h) {
    tip.hidden = true;
    return;
  }
  tip.textContent = `${h.d.score}점 · ${h.d.n}명 · ${h.d.pct.toFixed(2)}% (누가 ${h.d.cumPct.toFixed(2)}%)`;
  tip.hidden = false;
  tip.style.left = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8) + "px";
  tip.style.top = e.clientY - 34 + "px";
});
$("chart").addEventListener("mouseleave", () => (tip.hidden = true));

/* ---------- 문항 분석 (문항 지표 + 답지 분석 한 표) ---------- */
$("itemSort").addEventListener("change", () => S.result && renderItems());

const renderItems = () => {
  const r = S.result;
  const st = r.stats;
  const M = ITEM_METRIC_COLS;
  let html =
    "<thead>" +
    `<tr class="group"><th colspan="2"></th><th colspan="${M.length}">문항 지표</th><th colspan="6">답지 분석</th></tr>` +
    `<tr><th>문항</th><th>정답</th>${M.map((m) => `<th title="${esc(m.tip)}">${m.h}</th>`).join("")}` +
    `<th title="오답지 매력도 기준 = (1 − 난이도) ÷ (답지 수 − 1). 오답지의 전체 응답비율과 비교해 매력도를 판단">매력도 기준</th>` +
    `<th>답지</th><th title="전체 피험자 중 그 답지를 고른 비율">전체</th><th title="상위 27% 집단에서 그 답지를 고른 비율">상위</th>` +
    `<th title="하위 27% 집단에서 그 답지를 고른 비율">하위</th><th title="답지 선택 여부(1, 0)와 총점의 상관계수">상관계수</th></tr>` +
    "</thead>" +
    `<tbody class="total"><tr><td colspan="2">전체</td>${M.map((m) => `<td>${m.mean(st)}</td>`).join("")}<td colspan="6"></td></tr></tbody>`;
  sortItems(r.items, $("itemSort").value).forEach((it) => {
    const opts = visibleOptions(it);
    const n = opts.length;
    html += `<tbody class="item${it.scored ? "" : " unscored"}">`;
    opts.forEach((o, k) => {
      html += "<tr>";
      if (k === 0) {
        html += `<td rowspan="${n}" class="qno">${it.index}</td><td rowspan="${n}">${circ(it.key)}</td>`;
        if (it.scored)
          html +=
            M.map(
              (m, i) =>
                `<td rowspan="${n}"${
                  i === M.length - 1 && it.alphaUp
                    ? ' class="alpha-up" title="이 문항을 빼면 검사 α가 높아집니다"'
                    : i === R_COL && it.pointBiserial < 0
                      ? ' class="neg" title="변별도(r)가 음수입니다"'
                      : ""
                }>${m.get(it)}</td>`,
            ).join("") + `<td rowspan="${n}" class="attr">${f3(it.attractiveness)}</td>`;
        else html += `<td rowspan="${n}" colspan="${M.length + 1}" class="muted">분석 제외 문항</td>`;
      }
      html +=
        `<td class="opt${o.isKey ? " key-opt" : ""}">${circ(o.option)}${o.isKey ? " *" : ""}</td>` +
        `<td>${f3(o.propAll)}</td><td>${f3(o.propUpper)}</td><td>${f3(o.propLower)}</td><td>${f3(o.pbis)}</td></tr>`;
    });
    html += "</tbody>";
  });
  $("itemTable").innerHTML = html;
};

/* ---------- 저장 (Word · Excel) ---------- */
const baseName = () => (S.isDemo ? "예시_answer" : S.fileName.replace(/\.[^.]+$/, ""));

const saveBlob = async (filename, blob) => {
  let dl = null;
  try {
    dl = window.claude?.use ? await window.claude.use("downloads") : null;
  } catch (e) {
    dl = null;
  }
  if (dl) {
    try {
      await dl.save({ filename, data: blob });
      setStatus(`${filename} 파일을 저장했습니다.`, "ok");
    } catch (e) {
      if (e?.code !== "declined") setStatus(`파일을 저장하지 못했습니다 (${e?.code || e?.message || e}).`, "error");
    }
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  setStatus(`${filename} 파일을 저장했습니다.`, "ok");
};

const saveDocx = async (parts, suffix, btn) => {
  if (!S.result) return;
  if (!window.docx) {
    setStatus("Word 생성 모듈을 불러오지 못했습니다.", "error");
    return;
  }
  btn.disabled = true;
  setStatus("Word 보고서를 만드는 중…");
  try {
    const blob = await buildDocx(
      S.result,
      { fileName: S.isDemo ? "예시 자료(answer.dat)" : S.fileName, idLabel: idLabel(), itemSort: $("itemSort").value },
      parts,
    );
    await saveBlob(`${baseName()}_${suffix}.docx`, blob);
  } catch (err) {
    setStatus(`Word 보고서를 만들지 못했습니다: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
};
$("reportAll").addEventListener("click", (e) => saveDocx({ scores: true, items: true }, "분석보고서", e.currentTarget));
$("scoreDocx").addEventListener("click", (e) => saveDocx({ scores: true }, "점수분석", e.currentTarget));
$("itemDocx").addEventListener("click", (e) => saveDocx({ items: true }, "문항분석", e.currentTarget));
$("scoreXlsx").addEventListener("click", async () => {
  if (!S.result) return;
  try {
    await saveBlob(`${baseName()}_분석결과.xlsx`, buildXlsx(S.result, idLabel()));
  } catch (err) {
    setStatus(`Excel 파일을 만들지 못했습니다: ${err.message}`, "error");
  }
});

/* ---------- 정보 창 ---------- */
$("aboutBtn").addEventListener("click", () => ($("aboutModal").hidden = false));
$("aboutClose").addEventListener("click", () => ($("aboutModal").hidden = true));
document.querySelectorAll(".dialog-close").forEach((b) => b.addEventListener("click", () => (b.closest(".modal").hidden = true)));
$("aboutModal").addEventListener("click", (e) => e.target === e.currentTarget && (e.currentTarget.hidden = true));
document.addEventListener("keydown", (e) => e.key === "Escape" && ($("aboutModal").hidden = true));
