import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MyStyles } from "./stylesheet/MyStyles";
import { MaterialIcons } from "@expo/vector-icons";
import { InfoContext } from "../context/InfoContext";
import { useContext, useState } from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
import { AntDesign } from "@expo/vector-icons";

const BrgyCalendar = () => {
  const { events } = useContext(InfoContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  // Compare only YYYY-MM-DD in Asia/Manila timezone
  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDateStr = new Date(event.start).toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
      });
      const targetDateStr = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
      });
      return eventDateStr === targetDateStr;
    });
  };

  const todayEvents = getEventsForDate(selectedDate);

  const categories = [
    [
      { label: "General", color: "#4A90E2" },
      { label: "Health and Sanitation", color: "#7ED321" },
      { label: "Public Safety & Emergency", color: "#FF0000" },
    ],
    [
      { label: "Education and Youth", color: "#FFD942" },
      { label: "Social Services", color: "#B3B6B7" },
      { label: "Infrastructure", color: "#EC9300" },
    ],
  ];

  const CategoryItem = ({ color, label }) => (
    <View style={MyStyles.legendsRowWrapper}>
      <View style={[MyStyles.categoriesColors, { backgroundColor: color }]} />
      <Text style={[MyStyles.categoriesText, { fontSize: RFPercentage(1.4) }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "white",
      }}
    >
      <ScrollView
        contentContainerStyle={[
          MyStyles.scrollContainer,
          { backgroundColor: "white", gap: 10 },
        ]}
      >
        <AntDesign
          onPress={() => navigation.navigate("BottomTabs")}
          name="arrowleft"
          style={MyStyles.backArrow}
        />

        <Text style={[MyStyles.servicesHeader, { marginTop: 0 }]}>
          Calendar
        </Text>

        {/* Month Header */}
        <View
          style={{
            paddingHorizontal: 10,
          }}
        >
          {/* Legend */}
          <View style={[MyStyles.legendsRowWrapper, { marginTop: 30 }]}>
            {categories.map((column, columnIndex) => (
              <View key={columnIndex} style={MyStyles.legendsColWrapper}>
                {column.map((item, index) => (
                  <CategoryItem
                    key={index}
                    color={item.color}
                    label={item.label}
                  />
                ))}
              </View>
            ))}
          </View>

          <Text style={MyStyles.dateText}>
            {currentDate.toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          {/* Weekdays */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 5,
            }}
          >
            {weekDays.map((d, i) => (
              <Text
                key={i}
                style={[MyStyles.weekDay, { fontSize: RFPercentage(2) }]}
              >
                {d}
              </Text>
            ))}
          </View>

            {/* Calendar Days */}
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {calendarDays.map((item, index) => {
                const dateObj = item ? new Date(year, month, item) : null;

                // Get events for the specific day
                const dayEvents = dateObj ? getEventsForDate(dateObj) : [];

                // Filter events to exclude those in the past
                const currentDate = new Date();
                const filteredEvents = dayEvents.filter((event) => {
                  const eventStartDate = new Date(event.start);
                  return eventStartDate >= currentDate; // Only show events from today onwards
                });

                if (!item) {
                  return (
                    <View
                      key={index}
                      style={{ width: `${100 / 7}%`, aspectRatio: 1 }}
                    />
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: `${100 / 7}%`,
                      aspectRatio: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setSelectedDate(dateObj)}
                  >
                    <View
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <View
                        style={[
                          item === selectedDate.getDate() &&
                          month === selectedDate.getMonth() &&
                          year === selectedDate.getFullYear()
                            ? {
                                backgroundColor: "#0E94D3",
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                alignItems: "center",
                                justifyContent: "center",
                              }
                            : {},
                        ]}
                      >
                        <Text
                          style={[
                            {
                              fontSize: RFPercentage(1.8),
                              fontFamily: "QuicksandMedium",
                              color: "#000",
                            },
                            item === selectedDate.getDate() &&
                            month === selectedDate.getMonth() &&
                            year === selectedDate.getFullYear()
                              ? { color: "#fff" }
                              : {},
                          ]}
                        >
                          {item}
                        </Text>
                      </View>
                      {/* Event dots */}
                      {filteredEvents.length > 0 && (
                        <View style={{ flexDirection: "row", marginTop: 2 }}>
                          {filteredEvents.map((event, idx) => (
                            <View
                              key={idx}
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor:
                                  event.backgroundColor || "#3174ad",
                                marginHorizontal: 1,
                              }}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

          {/* Important Events */}
          <View style={{ marginTop: -30 }}>
            <Text style={[MyStyles.subHeader, { marginTop: 0 }]}>
              Important Events (
              {selectedDate.toLocaleDateString("en-US", {
                timeZone: "Asia/Manila",
              })}
              )
            </Text>

            {todayEvents.length > 0 ? (
              todayEvents.map((event, index) => {
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);

                const dateString = startDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "Asia/Manila",
                });
                const timeString = `${startDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Manila",
                })} – ${endDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Manila",
                })}`;

                return (
                  <View
                    key={index}
                    style={[
                      MyStyles.importantEventsWrapper,
                      {
                        backgroundColor: "rgba(211, 211, 211, 0.5)",
                      },
                    ]}
                  >
                    <Text style={MyStyles.importantEventsTitle}>
                      {event.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: RFPercentage(1.8),
                        color: "#888",
                        fontFamily: "QuicksandSemiBold",
                      }}
                    >
                      {dateString}
                    </Text>

                    <Text
                      style={{
                        fontSize: RFPercentage(1.8),
                        color: "white",
                        fontFamily: "QuicksandSemiBold",
                        backgroundColor: event.backgroundColor || "#808080",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 10,
                        alignSelf: "flex-start",
                        marginTop: 5,
                      }}
                    >
                      {timeString}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={MyStyles.noEvents}>NO IMPORTANT EVENTS.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BrgyCalendar;
