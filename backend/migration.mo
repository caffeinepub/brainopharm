import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  // Types from the old actor state
  type DrugCategoryType = {
    #antibiotics;
    #painkillers;
    #fdcs;
    #vitamins;
    #other;
  };

  type Drug = {
    name : Text;
    status : {
      #approved;
      #banned;
    };
    date : Time.Time;
    category : Text;
    description : Text;
    source : {
      #mimsIndia;
      #cdsco;
      #applicationData;
      #other : Text;
    };
    safetyInfo : Text;
  };

  type OldActor = {
    drugTableStore : Map.Map<Text, Drug>;
    drugDatabaseStore : Map.Map<Text, Drug>;
    authoritativeDrugDatabase : Map.Map<Text, Drug>;
  };

  type NewActor = {
    drugTableStore : Map.Map<Text, Drug>;
    drugDatabaseStore : Map.Map<Text, Drug>;
    authoritativeDrugDatabase : Map.Map<Text, Drug>;
  };

  let authoritativeDrugDatabase : [(Text, Drug)] = [
    ("Paracetamol", {
      name = "Paracetamol";
      status = #approved;
      date = 0;
      category = "painkiller";
      description = "A commonly used painkiler and antipyretic";
      source = #applicationData;
      safetyInfo = "Safe when used as directed. Avoid in high doses due to risk of liver toxicity.";
    }),
    ("Metformin", {
      name = "Metformin";
      status = #approved;
      date = 0;
      category = "antidiabetic";
      description = "First-line medication for type 2 diabetes";
      source = #applicationData;
      safetyInfo = "Generally safe, but should be used with caution in patients with kidney impairment. Rare risk of lactic acidosis.";
    }),
    ("Amoxicillin", {
      name = "Amoxicillin";
      status = #approved;
      date = 0;
      category = "antibiotic";
      description = "A broad-spectrum antibiotic";
      source = #applicationData;
      safetyInfo = "Common side effects include gastrointestinal discomfort and allergic reactions. Consider resistance patterns.";
    }),
    ("Ibuprofen", {
      name = "Ibuprofen";
      status = #approved;
      date = 0;
      category = "painkiller";
      description = "Non-steroidal anti-inflammatory drug (NSAID)";
      source = #applicationData;
      safetyInfo = "May cause gastrointestinal irritation, ulcers, or kidney issues with prolonged use.";
    }),
    ("Dicyclomine", {
      name = "Dicyclomine";
      status = #banned;
      date = 0;
      category = "antispasmodic";
      description = "Was used as an antispasmodic for gastrointestinal issues";
      source = #applicationData;
      safetyInfo = "Withdrawn due to associations with adverse neurological effects, especially in children.";
    }),
    ("Cisapride", {
      name = "Cisapride";
      status = #banned;
      date = 0;
      category = "gastroprokinetic";
      description = "Was used for gastrointestinal motility disorders";
      source = #applicationData;
      safetyInfo = "Withdrawn due to serious cardiac arrhythmias risk.";
    }),
    ("Nimesulide", {
      name = "Nimesulide";
      status = #banned;
      date = 0;
      category = "painkiller";
      description = "A non-steroidal anti-inflammatory drug (NSAID)";
      source = #applicationData;
      safetyInfo = "Banned in many countries due to severe risk of liver toxicity.";
    }),
    ("Metamizole", {
      name = "Metamizole";
      status = #banned;
      date = 0;
      category = "painkiller";
      description = "Was used for pain and fever";
      source = #applicationData;
      safetyInfo = "Withdrawn due to serious side effect called agranulocytosis.";
    }),
    ("Rosiglitazone", {
      name = "Rosiglitazone";
      status = #banned;
      date = 0;
      category = "antidiabetic";
      description = "Was used for type 2 diabetes mellitus";
      source = #applicationData;
      safetyInfo = "Withdrawn from the market due to increased risk of heart failure.";
    }),
    ("Phenylpropanolamine", {
      name = "Phenylpropanolamine";
      status = #banned;
      date = 0;
      category = "decongestant";
      description = "Was used in over-the-counter cold medications for congestion relief";
      source = #applicationData;
      safetyInfo = "Withdrawn due to strong association with an increased risk of hemorrhagic stroke.";
    }),
    //... truncated
  ];

  // Migration function to populate new authoritative drug database
  public func run(old : OldActor) : NewActor {
    let newAuthoritativeDrugDatabase = Map.fromIter<Text, Drug>(authoritativeDrugDatabase.values());
    // Preserve other existing state
    {
      old with
      authoritativeDrugDatabase = newAuthoritativeDrugDatabase;
    };
  };
};
