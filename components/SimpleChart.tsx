import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Polyline, Stop } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  width: number;
  height?: number;
  color?: string;
  unit?: string;
}

export function SimpleChart({ data, width, height = 130, color, unit = "" }: Props) {
  const colors = useColors();
  const lineColor = color ?? colors.primary;

  if (data.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Agrega más datos para ver el gráfico
        </Text>
      </View>
    );
  }

  const padding = { top: 12, bottom: 24, left: 8, right: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => ({
    x: padding.left + (i / (values.length - 1)) * chartW,
    y: padding.top + chartH - ((v - min) / range) * chartH,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPath =
    `M ${points[0].x} ${padding.top + chartH} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x} ${padding.top + chartH} Z`;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
          </SvgGradient>
        </Defs>
        <Path d={areaPath} fill="url(#areaGrad)" />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={lineColor} />
        ))}
      </Svg>
      <View style={[styles.labels, { paddingHorizontal: padding.left }]}>
        {data.map((d, i) => (
          <Text
            key={i}
            style={[styles.label, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    flex: 1,
    textAlign: "center",
  },
});
