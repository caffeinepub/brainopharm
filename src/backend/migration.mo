import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  // Define the old and new types for prescriber details (unchanged if not updated)
  type OldPrescriberDetails = {
    prefix : {
      #doctor;
      #practitionerNurse;
      #pharmacist;
    };
    fullName : Text;
    registrationNumber : Text;
    specialization : Text;
    contactNumber : Text;
    email : Text;
    address : Text;
  };

  // Old actor type
  type OldActor = {
    prescriberDetailsMap : Map.Map<Text, OldPrescriberDetails>;
    userProfiles : Map.Map<Principal, { name : Text; email : ?Text; role : Text }>;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
