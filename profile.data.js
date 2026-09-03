window.PORTFOLIO_DATA = {
  name: "Collins Warutumo",
  tagline: "Software Engineer & Cybersecurity Professional",
  about: "Software engineer and cybersecurity professional with 10+ years of experience building, securing, and operating enterprise platforms across fintech, telecommunications, and digital services. My career has two complementary tracks: software engineering, with a focus on backend systems, APIs, distributed services, workflow orchestration, cloud platforms, and full-stack delivery; and cybersecurity, spanning application security, cyber assurance, penetration testing, information security audits, digital forensics, and security architecture. I bring the two disciplines together through secure-by-design engineering and production-focused delivery.",
  location: "Nairobi, Kenya",
  contact: {
    email: "collinswarutumo@gmail.com",
    linkedin: "https://www.linkedin.com/in/waruts",
    github: "https://github.com/waruts1"
  },

  // The portfolio intentionally presents two complementary professional tracks.
  // Software engineering is the primary engineering track; cybersecurity is a
  // distinct specialist track and a differentiator rather than a replacement.
  careerTracks: [
    {
      id: "software",
      label: "Software Engineering",
      title: "Software Engineer",
      description: "Backend, distributed systems, APIs, workflow orchestration, cloud-native platforms, and full-stack product delivery.",
      strengths: [
        "Backend Engineering",
        "Distributed Systems",
        "Microservices Architecture",
        "REST API Design",
        "Event-Driven Architecture",
        "Workflow Orchestration",
        "Cloud-Native Engineering",
        "CI/CD & GitOps",
        "System Design",
        "Software Testing"
      ]
    },
    {
      id: "cyber",
      label: "Cybersecurity",
      title: "Cybersecurity Professional",
      description: "Application security, cyber assurance, penetration testing, security architecture, governance, risk, and digital forensics.",
      strengths: [
        "Application Security",
        "API Security",
        "Cloud Security",
        "Vulnerability Management",
        "Penetration Testing",
        "Security Architecture",
        "Information Security Audits",
        "Risk & Compliance",
        "Digital Forensics",
        "Secure SDLC"
      ]
    }
  ],

  highlights: [
    "10+ years across software engineering and cybersecurity",
    "Enterprise backend and API engineering experience in telecom and fintech environments",
    "Systems and platforms serving 20M+ monthly users",
    "Reusable OTP authentication service handling 5M+ monthly authentications",
    "Distributed workflow orchestration using Temporal and Java/Spring Boot",
    "Event-driven systems using Kafka and Redis",
    "Production cloud experience with AWS EKS, Kubernetes, GCP, GitOps, and CI/CD",
    "Enterprise API platform experience with Apigee Hybrid and OAuth 2.0",
    "Cybersecurity expertise spanning application, API, cloud, data, and enterprise security"
  ],

  skills: [
    // Software Engineering — core
    "Java (Spring Boot)",
    "Python",
    "JavaScript",
    "TypeScript",
    "PHP (Laravel)",
    "SQL",
    "API Development (REST)",
    "Microservices Architecture",
    "Distributed Systems",
    "System Design",
    "Event-Driven Architecture",
    "Full Stack Development",
    "Temporal Workflows",
    "Process Orchestration",
    "Workflow Automation",
    "Hibernate / JPA",
    "Spring Security",

    // Data & Messaging
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Kafka (Event Streaming)",
    "Apache Doris",
    "Data Modelling",
    "Multi-Tenant Architecture",

    // Cloud, Platform & Delivery
    "AWS (EKS)",
    "GCP",
    "Kubernetes",
    "Docker",
    "OpenShift",
    "CI/CD (Jenkins / FluxCD)",
    "GitOps",
    "FluxCD",
    "Helm",
    "Linux Administration",
    "SonarQube",
    "Apigee Hybrid (GCP)",

    // Frontend & Product Engineering
    "Vue.js",
    "Node.js",
    "Vite",
    "Pusher",
    "Streamlit",
    "Figma",
    "SAP ERP",

    // Cybersecurity & Assurance
    "Application Security",
    "API Security",
    "Vulnerability Management",
    "Penetration Testing (VAPT)",
    "Information Security Audits",
    "Risk Management",
    "Security Architecture",
    "Governance",
    "Compliance",
    "Digital Forensics",
    "Incident Response",
    "Security Operations",
    "Network Security",
    "Cloud Security",
    "Data Protection",
    "Ethical Hacking",
    "Threat Modelling",
    "Internal Controls",
    "Identity & Access Management",
    "Zero Trust Architecture",
    "OWASP",
    "Secure SDLC",

    // Security Governance & Tooling
    "ISO 27001",
    "NIST CSF",
    "COBIT",
    "PCI DSS",
    "GDPR",
    "CIS Controls",
    "ISO 22301",
    "GSMA Security",
    "SIEM / XDR",
    "Burp Suite",
    "Nmap",
    "Nessus",
    "Audit Reporting",
    "Regulatory Compliance",

    // AI & Emerging Engineering
    "Generative AI (Security Automation)",
    "LLM / Agentic AI (Experimentation)"
  ],

  certifications: [
    "Certified Information Systems Auditor (CISA) — ISACA #1163766",
    "Certified Information Security Manager (CISM) — ISACA #1163766",
    "Certified Ethical Hacker (CEH) — EC-Council #ECC2483150796",
    "Project Management Professional (PMP) — In Progress"
  ],

  projects: [
    {
      name: "Order Orchestration & Workflow Automation",
      description: "Designed and delivered an enterprise-grade Gen AI order orchestration engine powering a B2B Marketplace. Built on Temporal (Java) with Spring Boot microservices, GitOps CI/CD on AWS EKS, and SonarQube quality gates. Drove 80% enterprise sales growth and 75% revenue improvement through workflow automation.",
      url: "https://business.safaricom.co.ke/marketplace",
      category: "software",
      featured: true,
      tech: [
        "Java (Spring Boot)",
        "Temporal",
        "PostgreSQL",
        "Redis",
        "AWS EKS",
        "Kubernetes",
        "Jenkins",
        "FluxCD",
        "SonarQube"
      ]
    },
    {
      name: "Multi-Tenant Financial Services APIs",
      description: "Contributed to building scalable multi-tenant APIs for My One App, My County, and My Sacco — enabling citizens, county residents, and cooperative members to securely access financial and community services through a unified, governed platform architecture.",
      url: "",
      category: "software",
      featured: true,
      tech: [
        "Java (Spring Boot)",
        "Microservices",
        "REST APIs",
        "PostgreSQL",
        "Kafka",
        "Redis",
        "Multi-Tenancy"
      ]
    },
    {
      name: "OTP Verification Microservice",
      description: "Reusable OTP verification microservice for secure user authentication across enterprise systems. Handles 5M+ monthly authentications with high availability, fault tolerance, and secure token lifecycle management.",
      url: "https://business.safaricom.co.ke/track-order",
      category: "software",
      featured: true,
      tech: [
        "Java (Spring Boot)",
        "Microservices",
        "Redis",
        "REST API",
        "Authentication",
        "Security"
      ]
    },
    {
      name: "Apigee Hybrid API Gateway Management",
      description: "Managed Apigee Hybrid (GCP) deployment with Kubernetes-hosted runtime plane — covering API lifecycle governance, OAuth 2.0 security policies, mTLS configuration, rate limiting, and developer onboarding across enterprise integration surfaces.",
      url: "",
      category: "software",
      featured: true,
      tech: [
        "Apigee Hybrid (GCP)",
        "Kubernetes",
        "OAuth 2.0",
        "mTLS",
        "API Security",
        "GCP"
      ]
    },
    {
      name: "Digital Forensics Chain of Custody System",
      description: "MSc dissertation research and system implementation for preservation of the integrity of digital evidence. Developed a chain-of-custody management system focused on evidence integrity, traceability, and auditability for forensic investigation workflows.",
      url: "https://opac.library.strathmore.edu/bib/314908",
      category: "cyber",
      featured: true,
      tech: [
        "Laravel",
        "Digital Forensics",
        "Evidence Management",
        "MySQL"
      ]
    },
    {
      name: "PII Compliance Automation & Cyber Assurance",
      description: "Built automated scripts and cron jobs for PII violation detection and encryption standard enforcement across enterprise fintech platforms serving 20M+ monthly users. Leveraged AI tooling to guide developers on secure coding practices at scale.",
      url: "",
      category: "cyber",
      featured: true,
      tech: [
        "Python",
        "Bash Scripting",
        "Cron Jobs",
        "Data Protection Act",
        "ISO 27001",
        "AI-Assisted Security"
      ]
    },
    {
      name: "The Actuarial Society of Kenya Portal",
      description: "Membership management and CPD tracking platform for the Actuarial Society of Kenya. Automated event registration, professional compliance monitoring, and payments — achieving 60% revenue growth and 70% operational efficiency improvement.",
      url: "https://www.actuarieskenya.or.ke",
      category: "software",
      tech: [
        "Laravel",
        "WordPress",
        "MySQL",
        "Vue.js",
        "Payment Integration"
      ]
    },
    {
      name: "Café Payment & Customer Management System",
      description: "Real-time payment and customer management system integrated with NCBA. Event-driven backend with Pusher-based live transaction state management for seamless customer payment experiences.",
      url: "https://smilescafe.co.ke",
      category: "software",
      tech: [
        "Vue.js",
        "Laravel",
        "Vuex",
        "Vite",
        "Pusher",
        "MySQL"
      ]
    },
    {
      name: "Telegram FastBuddy Bot",
      description: "Python-based Telegram bot demonstrating API integration, automation, SQL-backed state management, CI/CD deployment, and conversational product design.",
      url: "https://t.me/i_fast_bot",
      github: "https://github.com/waruts1/fastbuddy",
      category: "software",
      tech: [
        "Flask",
        "Python",
        "SQL",
        "Telegram API",
        "CI/CD"
      ]
    },
    {
      name: "Jiji Vehicle Dataset Analysis",
      description: "Data analysis and visualisation of vehicle listings based on price, make, model, and year of manufacture. Demonstrates applied data analytics, exploratory data analysis, and interactive visualisation capabilities.",
      url: "",
      github: "https://github.com/waruts1/streamlit-jiji-vehicles-visualization",
      category: "software",
      tech: [
        "Python",
        "Streamlit",
        "Jupyter Notebook",
        "Pandas",
        "SQL"
      ]
    }
  ],

  experience: [
    {
      title: "Cyber Security Engineer",
      company: "Telco",
      category: "cyber",
      location: "Nairobi, Kenya",
      dates: "January 2026 – Present",
      responsibilities: [
        "Conduct risk-based information security audits and assurance reviews across applications, infrastructure, and operational processes",
        "Perform vulnerability assessments and penetration tests across web applications, APIs, and cloud environments",
        "Assess identity and access management (IAM/PAM) controls, encryption standards, and data protection compliance",
        "Deliver structured assurance reports to leadership and regulators with practical remediation guidance",
        "Leverage AI tooling and automation to scale security controls across engineering teams"
      ],
      achievements: [
        "Built automated PII detection scripts enforcing encryption and access standards across platforms serving 20M+ monthly users",
        "Implemented monitoring and anomaly detection mechanisms enabling early identification of unauthorised access patterns",
        "Deployed AI-assisted developer security guidance programme improving secure coding adoption across engineering teams"
      ],
      skills: [
        "Information Security Audits",
        "VAPT",
        "Risk Management",
        "Compliance & Governance",
        "Identity & Access Management",
        "Cloud Security (AWS)",
        "Incident Response",
        "Digital Forensics",
        "Penetration Testing",
        "Security Operations",
        "Network Security",
        "Automation (Python / CI/CD)",
        "ISO 27001",
        "NIST CSF"
      ]
    },
    {
      title: "Full Stack Developer",
      company: "Telco",
      category: "software",
      location: "Nairobi, Kenya",
      dates: "July 2021 – December 2025",
      responsibilities: [
        "Designed, developed, tested, and documented enterprise REST APIs using Java Spring Boot and microservices architecture",
        "Managed Apigee Hybrid (GCP) API gateway — traffic management, OAuth security policies, rate limiting, and developer onboarding",
        "Integrated enterprise applications with core business systems (CRM, CBS Billing, NCBA) via RESTful and event-driven APIs",
        "Built and maintained GitOps CI/CD pipelines (FluxCD, Jenkins, AWS EKS/Kubernetes) with automated testing and controlled rollouts",
        "Implemented Redis-driven event streaming for real-time state management and operational alerting"
      ],
      achievements: [
        "Delivered Zidisha recommendation engine serving 1M+ SME agents and 20M+ monthly customers — generating 19M+ in monthly revenue",
        "Built reusable OTP microservice handling 5M+ monthly authentications across integrated enterprise systems",
        "Engineered 2 SaaS products delivering 50% revenue boost and 30% customer base expansion",
        "Delivered 20+ analytical dashboards empowering sales and management with data-driven insights"
      ],
      skills: [
        "Java (Spring Boot)",
        "Apigee Hybrid (GCP)",
        "REST API Development",
        "Microservices Architecture",
        "Redis",
        "PostgreSQL",
        "AWS (EKS)",
        "Kubernetes",
        "CI/CD (Jenkins / FluxCD)",
        "GitOps",
        "Vue.js",
        "Authentication & Authorisation",
        "Data Protection Act Compliance",
        "SQL"
      ]
    },
    {
      title: "Process Automation Engineer",
      company: "Telco",
      category: "software",
      location: "Nairobi, Kenya",
      dates: "November 2020 – October 2021",
      responsibilities: [
        "Architected and implemented durable workflow orchestration using Temporal (Java) — long-running processes, saga patterns, retry logic, and activity workers",
        "Designed and tested enterprise-grade workflows for Gen AI order orchestration and SaaS product delivery",
        "Performed continuous audits on workflow performance, data integrity, and process compliance"
      ],
      achievements: [
        "Built Kazuri process engine powering B2B Marketplace — driving 80% enterprise sales growth and 30% customer onboarding improvement",
        "Delivered end-to-end order orchestration workflow achieving 75% revenue growth through resilient, fault-tolerant automation"
      ],
      skills: [
        "Temporal (Java)",
        "Workflow Orchestration",
        "Spring Boot",
        "Process Automation",
        "API Integration",
        "Python (Scripting)",
        "CI/CD",
        "AWS",
        "Kubernetes",
        "Audit & Testing"
      ]
    },
    {
      title: "Full Stack Developer",
      company: "@iLabAfrica — Strathmore University Research Centre",
      category: "software",
      location: "Nairobi, Kenya",
      dates: "August 2018 – October 2020",
      responsibilities: [
        "Delivered full stack features across WordPress, Django, Laravel, and Vue.js for research and civic platforms",
        "Conducted application security reviews and vulnerability assessments across production platforms",
        "Designed Figma prototypes for rapid development and stakeholder validation"
      ],
      achievements: [
        "Delivered Actuarial Society membership and CPD platform — 60% revenue growth and 70% operational efficiency improvement",
        "Implemented authentication and security controls for IMLU Incident Management System supporting 300+ case resolutions annually",
        "Completed QA and security assurance for Kenya Association of Manufacturers (KAM) Portal",
        "Built iLabPay payment gateway — secure, auditable fintech payment API with end-to-end compliance documentation"
      ],
      skills: [
        "Full Stack Development",
        "Laravel",
        "Django",
        "Vue.js",
        "WordPress",
        "Application Security",
        "VAPT",
        "Figma (Prototyping)",
        "Authentication",
        "SQL",
        "QA & Testing"
      ]
    },
    {
      title: "Cyber Security Engineer",
      company: "Strathmore University — iLabAfrica Research Centre",
      category: "cyber",
      location: "Nairobi, Kenya",
      dates: "May 2016 – July 2018",
      responsibilities: [
        "Implemented automated security tests and information security controls across research and civic platforms",
        "Conducted information security research including MSc dissertation on Digital Forensics Chain of Custody",
        "Performed IS audits and implemented information governance frameworks",
        "Designed secure architectures embedding controls-by-design from inception"
      ],
      achievements: [
        "MSc research: Digital Preservation of Digital Evidence Chain of Custody — published at Strathmore University Library",
        "Established security review processes for iLabPay, WILD Mara, MSALM, and Ushahidi platforms"
      ],
      skills: [
        "Information Security",
        "Digital Forensics",
        "Security Testing",
        "Automated Security Tests",
        "Information Governance",
        "IS Audits",
        "Risk Management",
        "Incident Response",
        "Compliance",
        "Secure SDLC"
      ]
    },
    {
      title: "ERP Support Engineer",
      company: "Kenya Power",
      category: "software",
      location: "Nakuru, Kenya",
      dates: "January 2015 – December 2015",
      responsibilities: [
        "SAP ERP configuration, support, and administration",
        "Computer hardware configuration and troubleshooting",
        "User training and technical support across operational teams"
      ],
      skills: [
        "SAP ERP",
        "ERP Support & Configuration",
        "System Troubleshooting",
        "Hardware Configuration",
        "User Training & Support",
        "SQL (Basic)"
      ]
    }
  ],

  education: [
    {
      degree: "MSc Information Systems Security — Digital Forensics Major",
      institution: "Strathmore University",
      detail: "Dissertation: Digital Preservation of Digital Evidence Chain of Custody"
    },
    {
      degree: "BSc Business and Information Technology — Second Upper Class",
      institution: "Strathmore University"
    },
    {
      degree: "CISA & CISM Certification Programme",
      institution: "ISACA"
    },
    {
      degree: "Certified Ethical Hacker (CEH)",
      institution: "EC-Council"
    }
  ]
};
