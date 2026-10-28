import { Header } from "./components/Header";
import { OrderRow } from "./components/OrderRow";
import { StatusChip } from "./components/StatusChip";
import { Search } from "./components/Search";
import { Toast } from "./components/Toast";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Menu } from "./components/Menu";
import { Stat } from "./components/Stat";
import { Empty } from "./components/Empty";
import Logo from "./logo.svg?react";

export function App() {
  return (
    <main>
      <Logo width={32} height={32} />
      <Header />
      <OrderRow />
      <StatusChip />
      <Search />
      <Toast />
      <Card />
      <Field />
      <Menu />
      <Stat />
      <Empty />
    </main>
  );
}
