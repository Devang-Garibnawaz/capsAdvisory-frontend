import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import { useTheme } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const SalesByCategoryWidget = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const data = [
    {
      name: 'profit',
      fill: theme.palette.primary.main,
      value: 400,
    },
    {
      name: 'loss',
      fill: theme.palette.warning.main,
      value: 300,
    }
  ];

  return (
    <Card>
      <CardHeader title={t("dashboard.salesByCategory.title")} />
      <CardContent>
        <ResponsiveContainer width="99%" height={244}>
          <PieChart>
            <Pie
              dataKey="value"
              isAnimationActive={false}
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              stroke={theme.palette.background.paper}
              strokeWidth={8}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 16,
                boxShadow: theme.shadows[3],
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.background.paper,
              }}
              itemStyle={{
                color: theme.palette.text.primary,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 14 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesByCategoryWidget;
