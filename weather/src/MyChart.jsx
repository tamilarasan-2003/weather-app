import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyChart = ({ forecastData }) => {
  if (!forecastData || forecastData.length === 0) return <p>No data available for the chart.</p>;

 
  const labels = forecastData.map((item) =>
    new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "long" })
  );
  const temperatures = forecastData.map((item) => item.main.temp);

  
  const data = {
    labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatures,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4, 
      },
    ],
  };

  
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Temperature Forecast" },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default MyChart;
