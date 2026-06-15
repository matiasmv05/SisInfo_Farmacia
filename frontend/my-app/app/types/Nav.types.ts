export interface NavItem {
  label: string;
  href:  string;
  icon:  string;
  roles: ("ADMINISTRADOR" | "OPERADOR")[];
}