//  Implement Ethiopian tax brackets here -- THIS IS CRUCIAL!
function calculateIncomeTax(taxableIncome) {
  // This is a placeholder - replace with actual Ethiopian tax law
  // Example (using a simplified, hypothetical tax bracket)
  if (taxableIncome <= 5000) {
    return 0; // 0% tax
  } else if (taxableIncome <= 10000) {
    return (taxableIncome - 5000) * 0.1; // 10% tax
  } else {
    return 500 + (taxableIncome - 10000) * 0.2; // 20% tax
  }
}

function calculateTaxableIncome(grossEarning, nonTaxableAllowance) {
  return grossEarning - nonTaxableAllowance;
}

function calculatePensionContributions(basicSalary) {
  const employeePensionContribution = basicSalary * 0.07; // 7%
  const employerPensionContribution = basicSalary * 0.11; // 11%
  return { employeePensionContribution, employerPensionContribution };
}

function calculateNetPay(grossEarning, totalDeductions) {
  return grossEarning - totalDeductions;
}

module.exports = {
  calculateTaxableIncome,
  calculateIncomeTax,
  calculatePensionContributions,
  calculateNetPay,
};
