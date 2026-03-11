import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { api } from "../services/api";
import { formatCurrency } from "@common-cents/shared";

export function DashboardScreen() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, netIncome: 0 });

  useEffect(() => {
    api.get("/reports/profit-loss").then((r) => setStats(r.data));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Revenue</Text>
        <Text style={[styles.value, { color: "#16a34a" }]}>{formatCurrency(stats.totalRevenue)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Expenses</Text>
        <Text style={[styles.value, { color: "#dc2626" }]}>{formatCurrency(stats.totalExpenses)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Net Income</Text>
        <Text style={[styles.value, { color: stats.netIncome >= 0 ? "#16a34a" : "#dc2626" }]}>
          {formatCurrency(stats.netIncome)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: { fontSize: 14, color: "#6b7280" },
  value: { fontSize: 28, fontWeight: "bold", marginTop: 4 },
});
