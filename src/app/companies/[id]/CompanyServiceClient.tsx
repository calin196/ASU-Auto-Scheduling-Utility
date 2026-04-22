"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { sendServiceRequest, sendServiceRequestToAll } from "./actions";

type Step1Key = "repair" | "maintenance" | "diagnostic";
type Step1Value = Step1Key | "" | "other" | "Undetermined";

type Company = {
  id: number;
  fullName: string;
  email: string;
};

type Category = {
  key: string;
  label: string;
  question3: string;
  options: string[];
};

type ServiceTree = {
  [K in Step1Key]: {
    label: string;
    question2: string;
    categories: Category[];
  };
};

const SERVICE_TREE: ServiceTree = {
  repair: {
    label: "Repair",
    question2: "Which vehicle area has the problem?",
    categories: [
      {
        key: "engine",
        label: "Engine",
        question3: "Which engine component seems affected?",
        options: [
          "Spark plugs",
          "Ignition coils",
          "Fuel injectors",
          "Fuel pump",
          "Air intake system",
          "Throttle body",
          "Mass air flow sensor (MAF)",
          "Oxygen sensor (O2 sensor)",
          "Timing belt / timing chain",
          "Serpentine belt",
          "Alternator",
          "Starter motor",
          "Battery",
          "Turbocharger",
          "Head gasket",
          "Engine mounts",
          "Water pump",
          "Oil pump",
          "Radiator fan",
        ],
      },
      {
        key: "transmission-drivetrain",
        label: "Transmission / Drivetrain",
        question3: "Which transmission or drivetrain component seems affected?",
        options: [
          "Clutch kit",
          "Gearbox / transmission assembly",
          "Torque converter",
          "Transmission control module",
          "Driveshaft",
          "CV joint",
          "Differential",
          "Axle shaft",
          "Transfer case",
          "Gear selector / linkage",
          "Transmission mounts",
        ],
      },
      {
        key: "braking-system",
        label: "Braking system",
        question3: "Which braking component seems affected?",
        options: [
          "Brake pads",
          "Brake discs / rotors",
          "Brake calipers",
          "Brake lines",
          "Brake master cylinder",
          "ABS sensor",
          "ABS module",
          "Parking brake system",
          "Brake booster",
        ],
      },
      {
        key: "suspension-steering",
        label: "Suspension / Steering",
        question3: "Which suspension or steering component seems affected?",
        options: [
          "Shock absorbers",
          "Struts",
          "Coil springs",
          "Control arms",
          "Ball joints",
          "Tie rod ends",
          "Steering rack",
          "Wheel bearing",
          "Stabilizer bar / sway bar links",
          "Bushings",
          "Power steering pump",
        ],
      },
      {
        key: "electrical-system",
        label: "Electrical system",
        question3: "Which electrical component seems affected?",
        options: [
          "Battery",
          "Alternator",
          "Starter motor",
          "Wiring / electrical harness",
          "Fuses / relays",
          "Lighting system",
          "Power windows",
          "Central locking system",
          "ECU / engine control unit",
          "Sensors",
        ],
      },
      {
        key: "cooling-system",
        label: "Cooling system",
        question3: "Which cooling component seems affected?",
        options: [
          "Radiator",
          "Water pump",
          "Thermostat",
          "Cooling fan",
          "Coolant hoses",
          "Expansion tank",
          "Temperature sensor",
          "Heater core",
        ],
      },
      {
        key: "exhaust-emissions",
        label: "Exhaust / Emissions",
        question3: "Which exhaust or emissions component seems affected?",
        options: [
          "Exhaust pipe",
          "Muffler / silencer",
          "Catalytic converter",
          "Diesel particulate filter (DPF)",
          "EGR valve",
          "Lambda / oxygen sensor",
          "Exhaust manifold",
        ],
      },
      {
        key: "hvac-air-conditioning",
        label: "HVAC / Air conditioning",
        question3: "Which HVAC component seems affected?",
        options: [
          "AC compressor",
          "Condenser",
          "Cabin blower motor",
          "Cabin air filter",
          "Evaporator",
          "Heater core",
          "Climate control panel",
          "Vent actuator / flap motor",
          "Refrigerant leak",
        ],
      },
      {
        key: "exterior-body",
        label: "Exterior / Body",
        question3: "Which exterior component seems affected?",
        options: [
          "Front bumper",
          "Rear bumper",
          "Hood",
          "Door",
          "Fender",
          "Mirror",
          "Windshield",
          "Wipers / washer system",
          "Headlight",
          "Taillight",
          "Paint / body damage",
        ],
      },
      {
        key: "interior",
        label: "Interior",
        question3: "Which interior component seems affected?",
        options: [
          "Dashboard / instrument cluster",
          "Infotainment system",
          "Seats",
          "Seatbelt system",
          "Interior lighting",
          "Door panel / trim",
          "Power window switch",
          "Airbag warning system",
          "Cabin controls",
        ],
      },
    ],
  },

  maintenance: {
    label: "Maintenance",
    question2: "What type of maintenance do you need?",
    categories: [
      {
        key: "filters",
        label: "Filters",
        question3: "Which filter needs service?",
        options: [
          "Engine oil filter",
          "Engine air filter",
          "Cabin air filter / pollen filter",
          "Fuel filter",
          "Transmission filter",
          "Hydraulic filter",
        ],
      },
      {
        key: "fluids-lubricants",
        label: "Fluids / Lubricants",
        question3: "Which fluid or lubricant needs service?",
        options: [
          "Engine oil",
          "Coolant / antifreeze",
          "Brake fluid",
          "Transmission fluid",
          "Power steering fluid",
          "Windshield washer fluid",
          "Differential oil",
          "Transfer case fluid",
          "Clutch fluid",
          "AdBlue / DEF",
        ],
      },
      {
        key: "brakes",
        label: "Brakes",
        question3: "Which brake maintenance service is needed?",
        options: [
          "Brake pad replacement",
          "Brake disc / rotor replacement",
          "Brake fluid replacement",
          "Brake inspection",
          "Handbrake / parking brake adjustment",
          "Full brake service",
        ],
      },
      {
        key: "engine-maintenance",
        label: "Engine maintenance",
        question3: "Which engine maintenance service is needed?",
        options: [
          "Spark plug replacement",
          "Ignition coil replacement",
          "Timing belt service",
          "Serpentine belt replacement",
          "Engine tune-up",
          "Throttle body cleaning",
          "Injector cleaning",
          "General engine service",
        ],
      },
      {
        key: "transmission-maintenance",
        label: "Transmission maintenance",
        question3: "Which transmission maintenance service is needed?",
        options: [
          "Transmission fluid change",
          "Transmission filter replacement",
          "Clutch inspection",
          "Clutch replacement",
          "Gearbox inspection",
          "Drivetrain lubrication",
        ],
      },
      {
        key: "tires-wheels",
        label: "Tires / Wheels",
        question3: "Which tire or wheel service is needed?",
        options: [
          "Tire replacement",
          "Tire rotation",
          "Wheel balancing",
          "Wheel alignment",
          "Seasonal tire change",
          "Tire pressure inspection",
        ],
      },
      {
        key: "battery-electrical-maintenance",
        label: "Battery / Electrical maintenance",
        question3: "Which electrical maintenance service is needed?",
        options: [
          "Battery replacement",
          "Battery health test",
          "Alternator check",
          "Starter check",
          "Lighting inspection",
          "Electrical system inspection",
        ],
      },
      {
        key: "air-conditioning-maintenance",
        label: "Air conditioning maintenance",
        question3: "Which AC maintenance service is needed?",
        options: [
          "AC gas / refrigerant recharge",
          "Cabin filter replacement",
          "AC leak inspection",
          "AC compressor inspection",
          "Vent cleaning / disinfection",
          "Full AC service",
        ],
      },
      {
        key: "general-scheduled-maintenance",
        label: "General scheduled maintenance",
        question3: "Which maintenance package do you want?",
        options: [
          "Minor service",
          "Full service",
          "Annual service",
          "Pre-trip inspection",
          "Manufacturer scheduled maintenance",
          "Unsure / recommend service",
        ],
      },
    ],
  },

  diagnostic: {
    label: "Diagnostic / Check-up",
    question2: "What type of diagnostic inspection do you want?",
    categories: [
      {
        key: "engine-diagnostic",
        label: "Engine diagnostic",
        question3: "What symptom are you experiencing?",
        options: [
          "Check engine light",
          "Loss of power",
          "Engine misfire",
          "Rough idle",
          "Hard starting",
          "Excessive smoke",
          "Overheating",
          "Oil leak",
          "Strange engine noise",
          "High fuel consumption",
        ],
      },
      {
        key: "transmission-diagnostic",
        label: "Transmission diagnostic",
        question3: "What symptom are you experiencing?",
        options: [
          "Hard shifting",
          "Delayed shifting",
          "Gear slipping",
          "Transmission warning light",
          "Clutch issue",
          "Vibration during driving",
          "Fluid leak",
          "Strange transmission noise",
        ],
      },
      {
        key: "brake-diagnostic",
        label: "Brake system diagnostic",
        question3: "What symptom are you experiencing?",
        options: [
          "Squeaking brakes",
          "Grinding noise",
          "Soft brake pedal",
          "Vibration during braking",
          "Car pulls while braking",
          "ABS warning light",
          "Reduced braking performance",
        ],
      },
      {
        key: "suspension-steering-diagnostic",
        label: "Suspension / steering diagnostic",
        question3: "What symptom are you experiencing?",
        options: [
          "Steering wheel vibration",
          "Car pulls to one side",
          "Knocking noise",
          "Unstable handling",
          "Uneven tire wear",
          "Stiff steering",
          "Loose steering feel",
        ],
      },
      {
        key: "electrical-diagnostic",
        label: "Electrical diagnostic",
        question3: "What symptom are you experiencing?",
        options: [
          "Battery drains quickly",
          "Car will not start",
          "Warning lights on dashboard",
          "Lights not working properly",
          "Window / lock malfunction",
          "Sensor fault",
          "Intermittent electrical issue",
        ],
      },
      {
        key: "cooling-diagnostic",
        label: "Cooling system diagnostic",
        question3: "What symptom are you experiencing?",
        options: [
          "Engine overheating",
          "Coolant leak",
          "Cooling fan not working",
          "Heater not working",
          "Coolant warning light",
          "Temperature fluctuates",
        ],
      },
      {
        key: "air-conditioning-diagnostic",
        label: "Air conditioning diagnostic",
        question3: "What symptom are you experiencing?",
        options: [
          "AC not cooling",
          "Weak airflow",
          "Bad smell from vents",
          "Strange noise from AC",
          "AC works intermittently",
          "Defogging problem",
        ],
      },
      {
        key: "full-vehicle-diagnostic",
        label: "Full vehicle diagnostic",
        question3: "What is the main reason for the inspection?",
        options: [
          "Dashboard warning light",
          "General inspection",
          "Car feels abnormal",
          "Before long trip",
          "After accident",
          "After repair verification",
          "Unsure, need full assessment",
        ],
      },
      {
        key: "pre-purchase-inspection",
        label: "Pre-purchase inspection",
        question3: "What do you want checked most carefully?",
        options: [
          "Engine condition",
          "Transmission condition",
          "Accident / body damage",
          "Suspension / steering",
          "Electronics",
          "Full car condition",
        ],
      },
      {
        key: "noise-vibration-inspection",
        label: "Noise / vibration inspection",
        question3: "Where is the issue most noticeable?",
        options: [
          "Engine bay",
          "Front suspension",
          "Rear suspension",
          "Brakes",
          "Steering wheel",
          "Underbody",
          "Cabin interior",
        ],
      },
    ],
  },
};

const UNDETERMINED = "Undetermined" as const;

function OptionCard({
  label,
  checked,
  locked,
  onSelect,
}: {
  label: string;
  checked: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        border: checked ? "1px solid #ffffff" : "1px solid #27272a",
        borderRadius: "14px",
        background: checked ? "#18181b" : "#0b0b0d",
        color: "white",
        opacity: locked && !checked ? 0.55 : 1,
        cursor: locked ? "default" : "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={onSelect}
      />
      <span>{label}</span>
    </label>
  );
}

function OtherInput({
  value,
  setValue,
  onSubmit,
  locked,
  placeholder,
}: {
  value: string;
  setValue: (value: string) => void;
  onSubmit: () => void;
  locked: boolean;
  placeholder: string;
}) {
  return (
    <div
      style={{
        marginTop: "12px",
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <input
        type="text"
        value={value}
        disabled={locked}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        style={{
          flex: "1 1 280px",
          minWidth: "260px",
          padding: "12px 14px",
          borderRadius: "12px",
          border: "1px solid #3f3f46",
          background: "#0b0b0d",
          color: "white",
          outline: "none",
        }}
      />

      <button
        type="button"
        disabled={locked}
        onClick={onSubmit}
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid white",
          background: "white",
          color: "black",
          fontWeight: 600,
          cursor: locked ? "default" : "pointer",
          opacity: locked ? 0.6 : 1,
        }}
      >
        Send
      </button>
    </div>
  );
}

export default function CompanyServiceClient({
  company,
  applyToAll = false,
}: {
  company?: Company;
  applyToAll?: boolean;
}) {
  const [step1, setStep1] = useState<Step1Value>("");
  const [step2, setStep2] = useState("");
  const [step3, setStep3] = useState("");

  const [showOtherStep1, setShowOtherStep1] = useState(false);
  const [showOtherStep2, setShowOtherStep2] = useState(false);
  const [showOtherStep3, setShowOtherStep3] = useState(false);

  const [otherStep1, setOtherStep1] = useState("");
  const [otherStep2, setOtherStep2] = useState("");
  const [otherStep3, setOtherStep3] = useState("");

  const [requestFeedback, setRequestFeedback] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedService = useMemo(() => {
    if (
      step1 === "repair" ||
      step1 === "maintenance" ||
      step1 === "diagnostic"
    ) {
      return SERVICE_TREE[step1];
    }
    return null;
  }, [step1]);

  const selectedCategory = useMemo(() => {
    if (!selectedService || !step2) return null;
    return (
      selectedService.categories.find((category) => category.key === step2) ||
      null
    );
  }, [selectedService, step2]);

  const step1Known =
    step1 === "repair" || step1 === "maintenance" || step1 === "diagnostic";

  const step2Known = Boolean(selectedCategory);

  const step1Finished = step1 !== "";
  const step1StopsFlow = step1 === "other" || step1 === UNDETERMINED;

  const step2Finished = step2 !== "";
  const step2StopsFlow = step2 === "other" || step2 === UNDETERMINED;

  const step3Finished = step3 !== "";

  const step1Display =
    step1 === UNDETERMINED
      ? UNDETERMINED
      : step1 === "other"
      ? otherStep1.trim()
      : step1Known
      ? SERVICE_TREE[step1].label
      : "";

  const step2Display =
    step2 === UNDETERMINED
      ? UNDETERMINED
      : step2 === "other"
      ? otherStep2.trim()
      : selectedCategory?.label || "";

  const step3Display =
    step3 === UNDETERMINED
      ? UNDETERMINED
      : step3 === "other"
      ? otherStep3.trim()
      : step3;

  const canShowQuestion2 = step1Known;
  const canShowQuestion3 = step1Known && step2Known;
  const canShowSummary =
    step1StopsFlow ||
    (step1Finished && step2StopsFlow) ||
    (step1Finished && step2Finished && step3Finished);

  const title = applyToAll ? "All Companies" : company?.fullName || "Company";

  function resetAll() {
    setStep1("");
    setStep2("");
    setStep3("");
    setShowOtherStep1(false);
    setShowOtherStep2(false);
    setShowOtherStep3(false);
    setOtherStep1("");
    setOtherStep2("");
    setOtherStep3("");
    setRequestFeedback("");
    setRequestSent(false);
  }

  function submitOtherStep1() {
    const value = otherStep1.trim();
    if (!value) return;

    setStep1("other");
    setStep2("");
    setStep3("");
    setShowOtherStep1(false);
    setShowOtherStep2(false);
    setShowOtherStep3(false);
    setRequestFeedback("");
    setRequestSent(false);
  }

  function submitOtherStep2() {
    const value = otherStep2.trim();
    if (!value) return;

    setStep2("other");
    setStep3("");
    setShowOtherStep2(false);
    setShowOtherStep3(false);
    setRequestFeedback("");
    setRequestSent(false);
  }

  function submitOtherStep3() {
    const value = otherStep3.trim();
    if (!value) return;

    setStep3("other");
    setShowOtherStep3(false);
    setRequestFeedback("");
    setRequestSent(false);
  }

  function handleStep1Select(value: Step1Value) {
    setStep1(value);
    setStep2("");
    setStep3("");
    setShowOtherStep1(false);
    setShowOtherStep2(false);
    setShowOtherStep3(false);
    setOtherStep2("");
    setOtherStep3("");
    setRequestFeedback("");
    setRequestSent(false);
  }

  function handleStep2Select(value: string) {
    setStep2(value);
    setStep3("");
    setShowOtherStep2(false);
    setShowOtherStep3(false);
    setOtherStep3("");
    setRequestFeedback("");
    setRequestSent(false);
  }

  function handleStep3Select(value: string) {
    setStep3(value);
    setShowOtherStep3(false);
    setRequestFeedback("");
    setRequestSent(false);
  }

  function handleSendRequest() {
    const serviceType = step1Display || UNDETERMINED;
    const category = step2Finished ? step2Display || UNDETERMINED : "";
    const exactIssue = step3Finished ? step3Display || UNDETERMINED : "";

    setRequestFeedback("");

    startTransition(async () => {
      const result = applyToAll
        ? await sendServiceRequestToAll({
            serviceType,
            category,
            exactIssue,
          })
        : await sendServiceRequest({
            providerId: company!.id,
            serviceType,
            category,
            exactIssue,
          });

      if (result.success) {
        setRequestSent(true);
        setRequestFeedback(result.message || "Request sent successfully.");
      } else {
        setRequestSent(false);
        setRequestFeedback(result.error || "Failed to send request.");
      }
    });
  }

  return (
    <main className="auth-shell">
      <div className="auth-card" style={{ maxWidth: "980px" }}>
        <p
          style={{
            margin: 0,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#a5b4fc",
            fontSize: "1rem",
            textAlign: "center",
          }}
        >
          Company Services
        </p>

        <h1
          style={{
            marginTop: "18px",
            marginBottom: "0",
            fontSize: "3rem",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: "16px",
            color: "#a1a1aa",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          {applyToAll
            ? "Select the requested service once and send it to all registered companies."
            : "Select the requested service. If you are not sure, choose I don't know or use Other to write your own answer."}
        </p>

        <div
          style={{
            marginTop: "36px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              border: "1px solid #27272a",
              borderRadius: "20px",
              padding: "24px",
              background: "#09090b",
            }}
          >
            <p
              style={{
                marginTop: 0,
                color: "#d4d4d8",
                fontSize: "1rem",
              }}
            >
              What type of service do you need?
            </p>

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {(Object.entries(SERVICE_TREE) as [
                Step1Key,
                ServiceTree[Step1Key]
              ][]).map(([key, value]) => (
                <OptionCard
                  key={key}
                  label={value.label}
                  checked={step1 === key}
                  locked={step1Finished}
                  onSelect={() => handleStep1Select(key)}
                />
              ))}

              <OptionCard
                label="Other"
                checked={step1 === "other"}
                locked={step1Finished}
                onSelect={() => setShowOtherStep1(true)}
              />

              {showOtherStep1 && !step1Finished && (
                <OtherInput
                  value={otherStep1}
                  setValue={setOtherStep1}
                  onSubmit={submitOtherStep1}
                  locked={step1Finished}
                  placeholder="Write the service type"
                />
              )}

              <OptionCard
                label="I don't know"
                checked={step1 === UNDETERMINED}
                locked={step1Finished}
                onSelect={() => handleStep1Select(UNDETERMINED)}
              />
            </div>
          </div>

          {canShowQuestion2 && (
            <div
              style={{
                border: "1px solid #27272a",
                borderRadius: "20px",
                padding: "24px",
                background: "#09090b",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "0",
                  fontSize: "1.5rem",
                  color: "white",
                }}
              >
                {step1Display}
              </h2>

              <p
                style={{
                  marginTop: "18px",
                  color: "#d4d4d8",
                  fontSize: "1rem",
                }}
              >
                {selectedService?.question2}
              </p>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {(selectedService?.categories || []).map((category) => (
                  <OptionCard
                    key={category.key}
                    label={category.label}
                    checked={step2 === category.key}
                    locked={step2Finished}
                    onSelect={() => handleStep2Select(category.key)}
                  />
                ))}

                <OptionCard
                  label="Other"
                  checked={step2 === "other"}
                  locked={step2Finished}
                  onSelect={() => setShowOtherStep2(true)}
                />

                {showOtherStep2 && !step2Finished && (
                  <OtherInput
                    value={otherStep2}
                    setValue={setOtherStep2}
                    onSubmit={submitOtherStep2}
                    locked={step2Finished}
                    placeholder="Write the category / area"
                  />
                )}

                <OptionCard
                  label="I don't know"
                  checked={step2 === UNDETERMINED}
                  locked={step2Finished}
                  onSelect={() => handleStep2Select(UNDETERMINED)}
                />
              </div>
            </div>
          )}

          {canShowQuestion3 && (
            <div
              style={{
                border: "1px solid #27272a",
                borderRadius: "20px",
                padding: "24px",
                background: "#09090b",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "0",
                  fontSize: "1.5rem",
                  color: "white",
                }}
              >
                {step2Display}
              </h2>

              <p
                style={{
                  marginTop: "18px",
                  color: "#d4d4d8",
                  fontSize: "1rem",
                }}
              >
                {selectedCategory?.question3}
              </p>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxHeight: "420px",
                  overflowY: "auto",
                  paddingRight: "6px",
                }}
              >
                {(selectedCategory?.options || []).map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    checked={step3 === option}
                    locked={step3Finished}
                    onSelect={() => handleStep3Select(option)}
                  />
                ))}

                <OptionCard
                  label="Other"
                  checked={step3 === "other"}
                  locked={step3Finished}
                  onSelect={() => setShowOtherStep3(true)}
                />

                {showOtherStep3 && !step3Finished && (
                  <OtherInput
                    value={otherStep3}
                    setValue={setOtherStep3}
                    onSubmit={submitOtherStep3}
                    locked={step3Finished}
                    placeholder="Write the exact issue / request"
                  />
                )}

                <OptionCard
                  label="I don't know"
                  checked={step3 === UNDETERMINED}
                  locked={step3Finished}
                  onSelect={() => handleStep3Select(UNDETERMINED)}
                />
              </div>
            </div>
          )}

          {canShowSummary && (
            <div
              style={{
                border: "1px solid #27272a",
                borderRadius: "20px",
                padding: "24px",
                background: "#09090b",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                Summary
              </h2>

              <ol
                style={{
                  marginTop: "18px",
                  paddingLeft: "22px",
                  color: "#d4d4d8",
                  lineHeight: 1.9,
                  fontSize: "1rem",
                }}
              >
                <li>
                  Service selected: <strong>{step1Display || UNDETERMINED}</strong>
                </li>

                {step2Finished && (
                  <li>
                    Category selected:{" "}
                    <strong>{step2Display || UNDETERMINED}</strong>
                  </li>
                )}

                {step3Finished && (
                  <li>
                    Exact issue / request:{" "}
                    <strong>{step3Display || UNDETERMINED}</strong>
                  </li>
                )}
              </ol>

              {requestFeedback && (
                <p
                  style={{
                    marginTop: "18px",
                    color: requestSent ? "#86efac" : "#fca5a5",
                    fontSize: "0.98rem",
                  }}
                >
                  {requestFeedback}
                </p>
              )}

              <div
                style={{
                  marginTop: "22px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-block",
                    padding: "12px 18px",
                    borderRadius: "14px",
                    border: "1px solid white",
                    background: "white",
                    color: "black",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Back to dashboard
                </Link>

                <button
                  type="button"
                  onClick={resetAll}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "14px",
                    border: "1px solid #3f3f46",
                    background: "transparent",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Start over
                </button>

                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={isPending || requestSent}
                  style={{
                    padding: "12px 18px",
                    borderRadius: "14px",
                    border: "1px solid white",
                    background: "white",
                    color: "black",
                    fontWeight: 600,
                    cursor: isPending || requestSent ? "default" : "pointer",
                    opacity: isPending || requestSent ? 0.7 : 1,
                  }}
                >
                  {isPending
                    ? "Sending..."
                    : requestSent
                    ? "Request sent"
                    : applyToAll
                    ? "Send to all companies"
                    : "Send request"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}